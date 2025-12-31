import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage, savePhotoFile, deletePhotoFile, deleteAlbumFiles, getOriginalsDir, getThumbnailsDir } from "./storage";
import { authenticate, generateToken, type AuthRequest } from "./auth";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import bcrypt from "bcrypt";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
      }

      const user = storage.getUserByUsername(username);
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user.id, user.username);
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Albums routes
  app.get("/api/albums", async (_req, res) => {
    try {
      const albums = storage.getAllAlbums();
      res.json(albums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch albums" });
    }
  });

  app.get("/api/albums/:id", async (req, res) => {
    try {
      const album = storage.getAlbumById(req.params.id);
      if (!album) {
        res.status(404).json({ message: "Album not found" });
        return;
      }
      res.json(album);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch album" });
    }
  });

  app.post("/api/albums", authenticate, async (req: AuthRequest, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ message: "Album name is required" });
        return;
      }

      const album = storage.createAlbum({ name, description });
      res.status(201).json(album);
    } catch (error: any) {
      console.error("Album creation error:", error);
      res.status(500).json({ message: "Failed to create album", error: error.message });
    }
  });

  app.patch("/api/albums/:id/cover", authenticate, async (req: AuthRequest, res) => {
    try {
      const albumId = req.params.id;
      const { photoId } = req.body;

      const album = storage.getAlbumById(albumId);
      if (!album) {
        res.status(404).json({ message: "Album not found" });
        return;
      }

      // Verify photo exists and belongs to this album
      const photo = storage.getPhotoById(photoId);
      if (!photo || photo.albumId !== albumId) {
        res.status(400).json({ message: "Invalid photo for this album" });
        return;
      }

      const updatedAlbum = storage.updateAlbum(albumId, { coverPhotoId: photoId });
      res.json(updatedAlbum);
    } catch (error: any) {
      console.error("Set cover error:", error);
      res.status(500).json({ message: "Failed to set album cover" });
    }
  });

  app.delete("/api/albums/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const albumId = req.params.id;
      const album = storage.getAlbumById(albumId);
      if (!album) {
        res.status(404).json({ message: "Album not found" });
        return;
      }

      // Delete all photos in the album first
      const photos = storage.getPhotosByAlbumId(albumId);
      for (const photo of photos) {
        await deletePhotoFile(albumId, photo.filename);
        storage.deletePhoto(photo.id);
      }

      // Delete album files
      await deleteAlbumFiles(albumId);

      // Delete album
      storage.deleteAlbum(albumId);
      res.json({ message: "Album deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete album" });
    }
  });

  // Photos routes
  app.get("/api/albums/:id/photos", async (req, res) => {
    try {
      const photos = storage.getPhotosByAlbumId(req.params.id);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post("/api/albums/:id/photos", authenticate, upload.array("photos", 20), async (req: AuthRequest, res) => {
    try {
      const albumId = req.params.id;
      const album = storage.getAlbumById(albumId);
      if (!album) {
        res.status(404).json({ message: "Album not found" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
      }

      const uploadedPhotos = [];
      for (const file of files) {
        const photoId = randomUUID();
        const filename = await savePhotoFile(albumId, photoId, file.originalname, file.buffer);
        
        const photo = storage.createPhoto({
          filename,
          originalName: file.originalname,
          albumId,
          fileSize: file.size,
        });

        uploadedPhotos.push(photo);
      }

      res.status(201).json({ photos: uploadedPhotos });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to upload photos" });
    }
  });

  app.delete("/api/photos/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const photoId = req.params.id;
      const photo = storage.getPhotoById(photoId);
      if (!photo) {
        res.status(404).json({ message: "Photo not found" });
        return;
      }

      await deletePhotoFile(photo.albumId, photo.filename);
      storage.deletePhoto(photoId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.get("/api/photos/:id/thumbnail", async (req, res) => {
    try {
      const photo = storage.getPhotoById(req.params.id);
      if (!photo) {
        res.status(404).json({ message: "Photo not found" });
        return;
      }

      const thumbnailPath = path.join(getThumbnailsDir(photo.albumId), photo.filename);
      res.sendFile(path.resolve(thumbnailPath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve thumbnail" });
    }
  });

  app.get("/api/photos/:id/original", async (req, res) => {
    try {
      const photo = storage.getPhotoById(req.params.id);
      if (!photo) {
        res.status(404).json({ message: "Photo not found" });
        return;
      }

      const originalPath = path.join(getOriginalsDir(photo.albumId), photo.filename);
      res.sendFile(path.resolve(originalPath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve original image" });
    }
  });

  return httpServer;
}
