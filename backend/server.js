import "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { generalLimiter, authLimiter } from "./middleware/rateLimit.middleware.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { successResponse } from "./utils/response.js";
import { logger } from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import professionalsRoutes from "./routes/professionals.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import usersRoutes from "./routes/users.routes.js";
import addressesRoutes from "./routes/addresses.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://127.0.0.1:5173";

app.use(helmet());

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

// Raised so base64 verification documents (PDF/images, max 2 MB) can be
// submitted; every payload is size-checked in the controller.
app.use(express.json({ limit: "4mb" }));

app.use(generalLimiter);

// Force HTTPS in production (e.g. behind Vercel/nginx). The proxy sets
// x-forwarded-proto; plain HTTP requests are redirected once.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    app.use((req, res, next) => {
        const proto = req.headers["x-forwarded-proto"];
        if (proto && proto.split(",")[0].trim() !== "https") {
            return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
        }
        next();
    });
}

app.get("/api/health", (req, res) => {
    return successResponse(res, {
        message: "FixKart API is running",
    });
});

// Login/register get a stricter limiter to slow brute-force attempts.
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/addresses", addressesRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(
        `FixKart API listening on http://localhost:${PORT}`
    );
});
