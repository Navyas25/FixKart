// Sample catalog data, shown by the catalog pages only while the Supabase
// tables are empty (RLS blocks app-side writes until the database is seeded).
// Shapes match the backend API responses exactly. Once you run
// backend/scripts/seed.sql (or `npm run seed`), real rows replace these
// automatically - the fallback only renders when the API returns nothing.
//
// Images use deterministic picsum URLs so they never 404.

export interface DemoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  brand: string;
  image_url: string;
  category: { name: string };
}

export interface DemoService {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  image_url: string;
}

export interface DemoProfessional {
  id: string;
  experience_years: number;
  rating: number;
  bio: string;
  profile: { full_name: string; avatar_url: string; phone: string };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "demo-prod-drill",
    name: "Bosch 10mm Impact Drill",
    description:
      "600W impact drill for masonry, wood and metal. Variable speed, keyless chuck, carry case included.",
    price: 2999,
    stock: 24,
    unit: "pc",
    brand: "Bosch",
    image_url: "https://picsum.photos/seed/fixkart-drill/600/400",
    category: { name: "Tools & Equipment" },
  },
  {
    id: "demo-prod-screwdriver",
    name: "Black & Decker Cordless Screwdriver",
    description:
      "3.6V cordless screwdriver with USB charging and a 32-piece bit set.",
    price: 1999,
    stock: 30,
    unit: "pc",
    brand: "Black & Decker",
    image_url: "https://picsum.photos/seed/fixkart-screwdriver/600/400",
    category: { name: "Tools & Equipment" },
  },
  {
    id: "demo-prod-tape",
    name: "Stanley 5m Measuring Tape",
    description:
      "Heavy-duty 5 metre tape measure with locking mechanism and durable ABS case.",
    price: 249,
    stock: 80,
    unit: "pc",
    brand: "Stanley",
    image_url: "https://picsum.photos/seed/fixkart-tape/600/400",
    category: { name: "Hand Tools" },
  },
  {
    id: "demo-prod-hammer",
    name: "Steel Claw Hammer 500g",
    description:
      "Drop-forged steel claw hammer with cushioned grip for carpentry and repairs.",
    price: 349,
    stock: 60,
    unit: "pc",
    brand: "FixKart Pro",
    image_url: "https://picsum.photos/seed/fixkart-hammer/600/400",
    category: { name: "Hand Tools" },
  },
  {
    id: "demo-prod-socket",
    name: "Havells 16A Switch Socket",
    description:
      "Modular 16A switch socket with child-safe shutters for heavy appliances.",
    price: 189,
    stock: 120,
    unit: "pc",
    brand: "Havells",
    image_url: "https://picsum.photos/seed/fixkart-socket/600/400",
    category: { name: "Electrical" },
  },
  {
    id: "demo-prod-wire",
    name: "Polycab 2.5 sq mm Wire (90m)",
    description:
      "ISI-marked FR house wire, 2.5 sq mm, 90 metre coil, low smoke insulation.",
    price: 1799,
    stock: 40,
    unit: "coil",
    brand: "Polycab",
    image_url: "https://picsum.photos/seed/fixkart-wire/600/400",
    category: { name: "Electrical" },
  },
  {
    id: "demo-prod-bulb",
    name: "Philips LED Bulb 9W",
    description:
      "9W B22 LED bulb, 806 lumens, warm white, 15,000 hour life.",
    price: 99,
    stock: 200,
    unit: "pc",
    brand: "Philips",
    image_url: "https://picsum.photos/seed/fixkart-bulb/600/400",
    category: { name: "Electrical" },
  },
  {
    id: "demo-prod-pipe",
    name: "Finolex 1-inch PVC Pipe (3m)",
    description:
      "Rigid PVC plumbing pipe, 1 inch diameter, 3 metre length.",
    price: 420,
    stock: 55,
    unit: "pc",
    brand: "Finolex",
    image_url: "https://picsum.photos/seed/fixkart-pipe/600/400",
    category: { name: "Plumbing" },
  },
  {
    id: "demo-prod-tap",
    name: "Jaquar Basin Mixer Tap",
    description:
      "Chrome-finished single-lever basin mixer with ceramic cartridge.",
    price: 2499,
    stock: 35,
    unit: "pc",
    brand: "Jaquar",
    image_url: "https://picsum.photos/seed/fixkart-tap/600/400",
    category: { name: "Plumbing" },
  },
  {
    id: "demo-prod-paint",
    name: "Asian Paints Ace Exterior Emulsion (20L)",
    description:
      "Weather-resistant exterior emulsion, 20 litre bucket with UV protection.",
    price: 5499,
    stock: 18,
    unit: "bucket",
    brand: "Asian Paints",
    image_url: "https://picsum.photos/seed/fixkart-paint/600/400",
    category: { name: "Paint & Decor" },
  },
  {
    id: "demo-prod-oil",
    name: "Castrol Engine Oil 5W-30 (3L)",
    description: "Fully synthetic engine oil for petrol and diesel cars.",
    price: 1299,
    stock: 45,
    unit: "L",
    brand: "Castrol",
    image_url: "https://picsum.photos/seed/fixkart-oil/600/400",
    category: { name: "Automotive" },
  },
  {
    id: "demo-prod-pump",
    name: "MRF Tyre Inflator with Gauge",
    description:
      "Heavy-duty foot pump with analogue gauge for cars, bikes and bicycles.",
    price: 599,
    stock: 70,
    unit: "pc",
    brand: "MRF",
    image_url: "https://picsum.photos/seed/fixkart-pump/600/400",
    category: { name: "Automotive" },
  },
  {
    id: "demo-prod-bolts",
    name: "Steel Hex Bolt Set (50 pc)",
    description:
      "Assorted zinc-plated hex bolts, nuts and washers in a storage box.",
    price: 199,
    stock: 90,
    unit: "set",
    brand: "FixKart Pro",
    image_url: "https://picsum.photos/seed/fixkart-bolts/600/400",
    category: { name: "Hardware & Fasteners" },
  },
  {
    id: "demo-prod-goggles",
    name: "3M Safety Goggles",
    description:
      "Anti-fog polycarbonate goggles with UV protection for workshop use.",
    price: 349,
    stock: 65,
    unit: "pc",
    brand: "3M",
    image_url: "https://picsum.photos/seed/fixkart-goggles/600/400",
    category: { name: "Safety & Protection" },
  },
];

export const DEMO_SERVICES: DemoService[] = [
  {
    id: "demo-svc-plumbing",
    name: "Plumbing Repair & Installation",
    category: "plumbing",
    description:
      "Leak repairs, tap and basin installation, pipe fitting and bathroom fittings by certified plumbers.",
    base_price: 299,
    image_url: "https://picsum.photos/seed/fixkart-svc-plumbing/600/400",
  },
  {
    id: "demo-svc-electrical",
    name: "Electrical Wiring & Fixes",
    category: "electrical",
    description:
      "Switchboard upgrades, wiring, circuit checks and appliance points by licensed electricians.",
    base_price: 349,
    image_url: "https://picsum.photos/seed/fixkart-svc-electric/600/400",
  },
  {
    id: "demo-svc-carpentry",
    name: "Carpentry & Furniture Assembly",
    category: "carpentry",
    description:
      "Custom furniture, door fitting, modular kitchen installation and flat-pack assembly.",
    base_price: 399,
    image_url: "https://picsum.photos/seed/fixkart-svc-carpentry/600/400",
  },
  {
    id: "demo-svc-ac",
    name: "AC Service & Repair",
    category: "ac-repair",
    description:
      "AC installation, gas refill, deep cleaning and annual maintenance contracts.",
    base_price: 499,
    image_url: "https://picsum.photos/seed/fixkart-svc-ac/600/400",
  },
  {
    id: "demo-svc-painting",
    name: "Painting & Wall Finishing",
    category: "painting",
    description:
      "Interior and exterior painting, putty work and premium texture finishes.",
    base_price: 299,
    image_url: "https://picsum.photos/seed/fixkart-svc-paint/600/400",
  },
  {
    id: "demo-svc-mechanic",
    name: "Car & Bike Mechanic",
    category: "automotive",
    description:
      "Servicing, engine repairs, brake work and roadside assistance for cars and two-wheelers.",
    base_price: 449,
    image_url: "https://picsum.photos/seed/fixkart-svc-mechanic/600/400",
  },
  {
    id: "demo-svc-appliance",
    name: "Home Appliance Repair",
    category: "appliance",
    description:
      "Repair and servicing of washing machines, refrigerators, ovens and water heaters at home.",
    base_price: 349,
    image_url: "https://picsum.photos/seed/fixkart-svc-appliance/600/400",
  },
  {
    id: "demo-svc-cleaning",
    name: "Home Deep Cleaning",
    category: "cleaning",
    description:
      "Full-home deep cleaning with professional equipment and eco-friendly products.",
    base_price: 249,
    image_url: "https://picsum.photos/seed/fixkart-svc-cleaning/600/400",
  },
];

export const DEMO_PROFESSIONALS: DemoProfessional[] = [
  {
    id: "demo-pro-rajesh",
    experience_years: 12,
    rating: 4.9,
    bio: "Certified plumber specialising in bathroom fittings, leak repairs, pipe installation and water heater setup across the city.",
    profile: {
      full_name: "Rajesh Kumar",
      avatar_url: "https://picsum.photos/seed/fixkart-rajesh/200/200",
      phone: "+91 98765 40001",
    },
  },
  {
    id: "demo-pro-suresh",
    experience_years: 8,
    rating: 4.8,
    bio: "Licensed electrician for house wiring, switchboard upgrades, appliance circuits and safety inspections.",
    profile: {
      full_name: "Suresh Reddy",
      avatar_url: "https://picsum.photos/seed/fixkart-suresh/200/200",
      phone: "+91 98765 40002",
    },
  },
  {
    id: "demo-pro-amit",
    experience_years: 15,
    rating: 4.7,
    bio: "Carpenter for custom furniture, door fitting, modular kitchens and precise flat-pack assembly.",
    profile: {
      full_name: "Amit Verma",
      avatar_url: "https://picsum.photos/seed/fixkart-amit/200/200",
      phone: "+91 98765 40003",
    },
  },
  {
    id: "demo-pro-deepak",
    experience_years: 10,
    rating: 4.9,
    bio: "AC technician offering installation, gas refills, deep cleaning and annual maintenance contracts for all brands.",
    profile: {
      full_name: "Deepak Sharma",
      avatar_url: "https://picsum.photos/seed/fixkart-deepak/200/200",
      phone: "+91 98765 40004",
    },
  },
  {
    id: "demo-pro-vikram",
    experience_years: 9,
    rating: 4.6,
    bio: "Painter for interior and exterior work, putty and primer coats, and premium texture finishes.",
    profile: {
      full_name: "Vikram Singh",
      avatar_url: "https://picsum.photos/seed/fixkart-vikram/200/200",
      phone: "+91 98765 40005",
    },
  },
  {
    id: "demo-pro-mohan",
    experience_years: 14,
    rating: 4.8,
    bio: "Two-wheeler and car mechanic for regular servicing, engine repairs, brake work and roadside assistance.",
    profile: {
      full_name: "Mohan Das",
      avatar_url: "https://picsum.photos/seed/fixkart-mohan/200/200",
      phone: "+91 98765 40006",
    },
  },
];
