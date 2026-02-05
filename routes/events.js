import express from "express";
import db from "../db.js";

const router = express.Router();

/* =======================
   ALL RECENT EVENTS
======================= */
router.get("/recent", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM recent_events ORDER BY date DESC"
    );

    res.render("events-recent", {
      recentEvents: result.rows,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/* =======================
   SINGLE RECENT EVENT
======================= */
router.get("/recent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM recent_events WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Event not found");
    }

    res.render("event-detail", {
      event: result.rows[0],
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/* =======================
   ALL UPCOMING EVENTS
======================= */
router.get("/upcoming", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM events ORDER BY date ASC"
    );

    res.render("events-upcoming", {
      events: result.rows,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/* =======================
   SINGLE UPCOMING EVENT
======================= */
router.get("/upcoming/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Event not found");
    }

    res.render("event-detail", {
      event: result.rows[0],
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
