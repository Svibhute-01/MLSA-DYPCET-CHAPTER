import express from "express";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "../db.js";

const router = express.Router();

/* =========================
   🧭 Passport Strategy
========================= */
passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          username,
        ]);

        if (result.rows.length === 0) {
          return done(null, false);
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  done(null, result.rows[0]);
});

/* =========================
   🔒 Auth Middleware
========================= */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/admin/login");
}

/* =========================
   🧭 Login Routes
========================= */
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/admin/dashboard");
  }
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
  }),
);

router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/admin/login"));
});

/* =========================
   📊 Dashboard
========================= */
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const events = await db.query("SELECT * FROM events ORDER BY date ASC");
  res.render("admin/dashboard", { events: events.rows });
});

/* =========================
   🖼 Multer Setup
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

//Add Recent events

router.get("/recent-events/new", ensureAuthenticated, (req, res) => {
  res.render("admin/add_recent_event");
});

router.post(
  "/recent-events/add",
  ensureAuthenticated,
  upload.single("eventImage"),
  async (req, res) => {
    try {
      const {
        eventTitle,
        eventType,
        eventMode,
        eventDate,
        eventTime,
        eventDescription,
        eventVenue,
      } = req.body;

      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      await db.query(
        `INSERT INTO recent_events
   (title, type, mode, date, time, description, venue, image_url)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          eventTitle,
          eventType,
          eventMode,
          eventDate,
          eventTime,
          eventDescription,
          eventVenue,
          imagePath,
        ],
      );

      res.redirect("/admin/dashboard");
    } catch (err) {
      console.error("Error adding recent event:", err);
      res.status(500).send("Failed to add recent event");
    }
  },
);


router.get("/recent-events/manage", ensureAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM recent_events ORDER BY date DESC"
    );

    res.render("admin/manage-recent-events", {
      events: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading recent events");
  }
});


router.post(
  "/recent-events/delete/:id",
  ensureAuthenticated,
  async (req, res) => {
    await db.query(
      "DELETE FROM recent_events WHERE id = $1",
      [req.params.id]
    );

    res.redirect("/admin/recent-events/manage");
  }
);

/* =========================
   ➕ Add Event
========================= */
router.get("/events/new", ensureAuthenticated, (req, res) =>
  res.render("admin/add_event"),
);

router.post(
  "/add-event",
  ensureAuthenticated,
  upload.single("eventImage"),
  async (req, res) => {
    const {
      eventTitle,
      eventType,
      eventMode,
      eventDate,
      eventTime,
      eventDescription,
      eventVenue,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    await db.query(
      `INSERT INTO events
       (title, type, mode, date, time, description, venue, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        eventTitle,
        eventType,
        eventMode,
        eventDate,
        eventTime,
        eventDescription,
        eventVenue,
        imagePath,
      ],
    );

    res.redirect("/admin/dashboard");
  },
);

/* =========================
   📋 Manage Events
========================= */
router.get("/events/manage", ensureAuthenticated, async (req, res) => {
  const events = await db.query("SELECT * FROM events ORDER BY date ASC");
  res.render("admin/manage-events", { events: events.rows });
});

router.post("/events/delete/:id", ensureAuthenticated, async (req, res) => {
  await db.query("DELETE FROM events WHERE id=$1", [req.params.id]);
  res.redirect("/admin/events/manage");
});

/* =========================
   👥 Team Routes
========================= */
router.get("/team/new", ensureAuthenticated, (req, res) =>
  res.render("admin/add-team"),
);

router.post(
  "/team/add",
  ensureAuthenticated,
  upload.single("memberPhoto"),
  async (req, res) => {
    const { memberName, memberRole, memberInfo } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    await db.query(
      `INSERT INTO team_members (name, role, info, photo_url)
       VALUES ($1,$2,$3,$4)`,
      [memberName, memberRole, memberInfo, photoPath],
    );

    res.redirect("/admin/dashboard");
  },
);

router.get("/team/manage", ensureAuthenticated, async (req, res) => {
  const members = await db.query("SELECT * FROM team_members");
  res.render("admin/manage-team", { members: members.rows });
});

export default router;
