import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { loadSongs, getSongById, updateSong, loadPlaylists } from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin token store (in-memory, single admin)
const adminTokens = new Set<string>();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "default-secret-change-me";

// Uploads directory
const uploadsDir = path.resolve(__dirname, "..", "data", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.cookies?.admin_token;
  if (!token || !adminTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  app.use(cookieParser(ADMIN_SECRET));

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // === Admin Auth ===
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = crypto.randomUUID();
    adminTokens.add(token);
    res.cookie("admin_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });
    res.json({ ok: true });
  });

  app.post("/api/admin/logout", (req, res) => {
    const token = req.cookies?.admin_token;
    if (token) adminTokens.delete(token);
    res.clearCookie("admin_token");
    res.json({ ok: true });
  });

  app.get("/api/admin/verify", (req, res) => {
    const token = req.cookies?.admin_token;
    const authenticated = !!token && adminTokens.has(token);
    res.json({ authenticated });
  });

  // === Songs API ===
  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await loadSongs();
      const token = req.cookies?.admin_token;
      const isAdmin = !!token && adminTokens.has(token);
      // Public: only visible songs. Admin: all songs
      const result = isAdmin ? songs : songs.filter((s) => s.visible);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to load songs" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const song = await getSongById(req.params.id);
      if (!song) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      const token = req.cookies?.admin_token;
      const isAdmin = !!token && adminTokens.has(token);
      if (!song.visible && !isAdmin) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      res.json(song);
    } catch (e) {
      res.status(500).json({ error: "Failed to load song" });
    }
  });

  app.patch("/api/songs/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await updateSong(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update song" });
    }
  });

  // === Upload ===
  app.post(
    "/api/upload/cover",
    requireAdmin,
    upload.single("cover"),
    (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    },
  );

  // === Playlists API ===
  app.get("/api/playlists", async (_req, res) => {
    try {
      const playlists = await loadPlaylists();
      res.json(playlists);
    } catch (e) {
      res.status(500).json({ error: "Failed to load playlists" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
