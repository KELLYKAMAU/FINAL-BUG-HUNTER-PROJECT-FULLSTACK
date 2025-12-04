// src/routes/auth.routes.ts
import { Router } from "express";
import { sendEmail } from "../services/emailService";
import { registerUser, loginUser } from "../controllers/auth.controller";

const router = Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "yourTestEmail@gmail.com",
      subject: "Bug Tracker Test Email",
      html: "<p>Test successful 🎉</p>",
    });

    res.json({ message: "Email sent!" });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// AUTH ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
