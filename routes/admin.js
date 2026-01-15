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
        const result = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [username]
        );

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
    }
  )
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
  })
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

/* =========================
   ➕ Add Event
========================= */
router.get("/events/new", ensureAuthenticated, (req, res) =>
  res.render("admin/add_event")
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
      ]
    );

    res.redirect("/admin/dashboard");
  }
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
  res.render("admin/add-team")
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
      [memberName, memberRole, memberInfo, photoPath]
    );

    res.redirect("/admin/dashboard");
  }
);

router.get("/team/manage", ensureAuthenticated, async (req, res) => {
  const members = await db.query("SELECT * FROM team_members");
  res.render("admin/manage-team", { members: members.rows });
});

/* =====================================================
   🔥 EVENT REGISTRATION ROUTES
===================================================== */

/* ➕ Create Registration */
router.get("/event-registration/new", ensureAuthenticated, async (req, res) => {
  const events = await db.query("SELECT id, title FROM events");
  res.render("admin/event-registration-new", { events: events.rows });
});

router.post(
  "/event-registration/add",
  ensureAuthenticated,
  upload.single("poster"), // <-- match the input field name
  async (req, res) => {
    const { eventId, registrationLink, isActive } = req.body;
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : null;

    await db.query(
      `INSERT INTO event_registrations
       (event_id, google_form_link, poster_url, is_active)
       VALUES ($1,$2,$3,$4)`,
      [eventId, registrationLink, posterUrl, isActive === "true"]
    );

    res.redirect("/admin/event-registration/manage");
  }
);


/* 📋 Manage Registrations */
router.get(
  "/event-registration/manage",
  ensureAuthenticated,
  async (req, res) => {
    const registrations = await db.query(`
      SELECT er.*, e.title
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      ORDER BY e.date ASC
    `);

    res.render("admin/event-registration-manage", {
      registrations: registrations.rows,
    });
  }
);

router.post(
  "/event-registration/delete/:id",
  ensureAuthenticated,
  async (req, res) => {
    await db.query("DELETE FROM event_registrations WHERE id=$1", [
      req.params.id,
    ]);
    res.redirect("/admin/event-registration/manage");
  }
);

export default router;
