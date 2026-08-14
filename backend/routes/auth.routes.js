import express from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", getCurrentUser);

router.get("/protected", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You have accessed a protected FixKart route",
        user: {
            id: req.user.id,
            email: req.user.email,
        },
    });
});

router.post("/logout", logout);

export default router;
