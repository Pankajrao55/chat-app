import express from "express";
import { getUsers, searchUsers, getMyStats } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/search", protect, searchUsers);
router.get("/stats/me", protect, getMyStats);

export default router;
