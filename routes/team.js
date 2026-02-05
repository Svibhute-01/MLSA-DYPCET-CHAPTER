import express from "express";
import db from "../db.js";

const router = express.Router();

// 🔹 ALL TEAM MEMBERS
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM team_members ORDER BY id ASC"
    );

    res.render("team", {
      team: result.rows,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
