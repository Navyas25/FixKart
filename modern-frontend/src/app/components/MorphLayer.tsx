import { useEffect, useRef, useState } from "react";

interface MorphLayerProps {
  /** Scroll progress 0..1 across the whole sequence. */
  progress: number;
  /** Image srcs, in order. */
  images: string[];
  /** Cut points (0..1) where one image hands over to the next. */
  cuts: number[];
  /** Width of each morph band as a fraction of progress. */
  transition: number;
}

// Fullscreen quad: vUv spans 0..1 across the viewport.
const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Morph shader: the two images zoom toward each other, swirl and warp with a
// liquid displacement field, soften through a blurred mid-state, and blend -
// so frame N visibly *becomes* frame N+1 instead of sliding or fading.
const FRAG_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;
uniform vec2 uTexAspect;
uniform vec2 uViewAspect;

// object-cover mapping so the texture fills the viewport like CSS cover.
vec2 coverUv(vec2 uv) {
  vec2 scale = vec2(1.0);
  if (uTexAspect.x / uTexAspect.y > uViewAspect.x / uViewAspect.y) {
    scale.x = (uViewAspect.x / uViewAspect.y) / (uTexAspect.x / uTexAspect.y);
  } else {
    scale.y = (uTexAspect.x / uTexAspect.y) / (uViewAspect.x / uViewAspect.y);
  }
  return (uv - 0.5) * scale + 0.5;
}

// Liquid swirl around the centre, strongest mid-transition.
vec2 swirlUv(vec2 uv, float amount) {
  vec2 d = uv - 0.5;
  float r = length(d);
  float ang = amount * (1.0 - smoothstep(0.0, 0.55, r));
  float s = sin(ang);
  float c = cos(ang);
  return vec2(d.x * c - d.y * s, d.x * s + d.y * c) + 0.5;
}

// 5-tap golden-angle blur - soft-focus midpoint sells the morph.
vec4 blur5(sampler2D tex, vec2 uv, float radius) {
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 5; i++) {
    float ang = float(i) * 2.39996;
    vec2 off = vec2(sin(ang), cos(ang)) * radius;
    acc += texture2D(tex, uv + off);
  }
  return acc / 5.0;
}

void main() {
  float t = uProgress;
  float mid = sin(t * 3.14159265);

  // Zoom convergence: the outgoing image pulls back, the incoming pushes in.
  vec2 fuv = swirlUv((vUv - 0.5) / (1.0 + 0.10 * t) + 0.5, mid * 0.18);
  vec2 tuv = swirlUv((vUv - 0.5) / (1.0 + 0.10 * (1.0 - t)) + 0.5, -mid * 0.18);

  // Warp both toward each other with a travelling noise field.
  float wob = mid * 0.016;
  fuv += vec2(sin(fuv.y * 45.0 + t * 10.0), cos(fuv.x * 40.0 - t * 8.0)) * wob;
  tuv += vec2(sin(tuv.y * 45.0 + t * 10.0 + 2.1), cos(tuv.x * 40.0 - t * 8.0 + 2.1)) * wob;

  float blur = mid * 0.012;
  vec4 from = blur5(uFrom, coverUv(fuv), blur);
  vec4 to = blur5(uTo, coverUv(tuv), blur);

  gl_FragColor = mix(from, to, t);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Morph shader compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function MorphLayer({ progress, images, cuts, transition }: MorphLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"webgl" | "css">("css");

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<Map<string, WebGLTexture>>(new Map());
  const imgRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const pairRef = useRef<[number, number] | null>(null);
  const [tick, setTick] = useState(0); // re-draw trigger as images arrive
  const last = images.length - 1;
  const T = transition;

  // Init WebGL once; fall back to the CSS morph if unavailable.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;
    // DOM images upload bottom-up; flip so they display upright.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Morph program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    progRef.current = prog;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    gl.uniform1i(gl.getUniformLocation(prog, "uFrom"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "uTo"), 1);

    // Preload every frame image.
    images.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current.set(src, img);
        setTick((t) => t + 1); // wake the draw effect once the image is in
      };
      img.src = src;
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(gl.getUniformLocation(prog, "uViewAspect"), window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    setMode("webgl");

    return () => {
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      texturesRef.current.forEach((tex) => gl.deleteTexture(tex));
      texturesRef.current.clear();
      glRef.current = null;
      progRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw whenever scroll progress changes - this is the live morph scrub.
  useEffect(() => {
    if (mode !== "webgl") return;
    const gl = glRef.current;
    const prog = progRef.current;
    if (!gl || !prog) return;

    // Which pair is active, and how far through the morph are we?
    let from = 0;
    let to = 0;
    let t = 0;
    for (let k = 0; k < cuts.length; k++) {
      const c = cuts[k];
      if (progress >= c - T / 2 && progress <= c + T / 2) {
        from = k;
        to = k + 1;
        t = Math.min(1, Math.max(0, (progress - (c - T / 2)) / T));
        break;
      }
    }
    if (progress < cuts[0] - T / 2) {
      from = 0;
      to = 1;
      t = 0;
    } else if (progress > cuts[cuts.length - 1] + T / 2) {
      from = last;
      to = last;
      t = 0;
    }

    const fromImg = imgRef.current.get(images[from]);
    const toImg = imgRef.current.get(images[to]);
    if (!fromImg || !toImg) return; // images still loading

    const getTexture = (src: string, img: HTMLImageElement): WebGLTexture => {
      let tex = texturesRef.current.get(src);
      if (!tex) {
        tex = gl.createTexture()!;
        texturesRef.current.set(src, tex);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }
      return tex;
    };

    if (pairRef.current?.[0] !== from || pairRef.current?.[1] !== to) {
      pairRef.current = [from, to];
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, getTexture(images[from], fromImg));
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, getTexture(images[to], toImg));
      gl.uniform2f(gl.getUniformLocation(prog, "uTexAspect"), fromImg.naturalWidth, fromImg.naturalHeight);
    }

    // Smoothstep the morph so it accelerates like a camera.
    const eased = t * t * (3 - 2 * t);
    gl.uniform1f(gl.getUniformLocation(prog, "uProgress"), eased);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [progress, mode, cuts, T, last, images, tick]);

  // The canvas is always mounted so the WebGL init effect can find it; it is
  // transparent until the first draw, and the CSS fallback (below) is only
  // used when WebGL is unavailable.
  const cssStyle = (i: number, p: number) => {
    const n = images.length;
    const start = i === 0 ? 0 : cuts[i - 1] - T / 2;
    const end = i === n - 1 ? 1 : cuts[i] + T / 2;
    if (p < start || p > end) {
      return { opacity: 0, transform: "scale(1.06)", filter: undefined };
    }
    const ramp = 0.03;
    const near = Math.min((p - start) / ramp, (end - p) / ramp); // 0 at edges, 1 mid
    const edge = Math.max(0, 1 - near);
    return {
      opacity: Math.min(1, near),
      transform: `scale(${1 + 0.1 * edge})`,
      filter: edge > 0 ? `blur(${(4 * edge).toFixed(2)}px)` : undefined,
    };
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      />
      {mode === "css" && (
        <div className="absolute inset-0">
          {images.map((src, i) => (
            <div key={src} className="absolute inset-0" style={cssStyle(i, progress)}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
