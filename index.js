import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";

import adminRoutes from "./routes/admin.js";
import { db } from "./db.js"; // ✅ make sure this matches your export

const app = express();

// ==============================
// 🧩 Core Middleware
// ==============================
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// ==============================
// 🔐 Session & Passport Middleware
// ==============================
app.use(
  session({
    secret: process.env.SESSION_SECRET, // use process.env.SESSION_SECRET in production
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ==============================
// 🌍 Global User Middleware
// Makes 'user' available in all EJS templates
// ==============================
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// ==============================
// 🛠 Routes
// ==============================
app.use("/admin", adminRoutes);

// 🏠 Home route
app.get("/", async (req, res) => {
  try {
    const eventsResult = await db.query("SELECT * FROM events ORDER BY date ASC");
    const teamResult = await db.query("SELECT * FROM team_members ORDER BY id ASC");

    // Optional: join with registration info if needed
    const registrationsResult = await db.query("SELECT * FROM event_registrations WHERE is_active = true");

    // Merge registration info into events for easy access in EJS
    const eventsWithRegistration = eventsResult.rows.map(event => {
      const reg = registrationsResult.rows.find(r => r.event_id === event.id);
      return {
        ...event,
        registration_link: reg ? reg.google_form_link : null,
        poster_url: reg ? reg.poster_url : null
      };
    });

    res.render("index", {
      events: eventsWithRegistration,
      team: teamResult.rows,
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching home page data:", err);
    res.status(500).send("Error loading home page");
  }
});


// Redirect /login → /admin/login
app.get("/login", (req, res) => res.redirect("/admin/login"));

// ==============================
// 🚀 Server Setup
// ==============================
const port = 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
