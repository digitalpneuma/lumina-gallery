import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq, desc, sql } from "drizzle-orm";
import { users, albums, photos, type User, type Album, type Photo, type InsertUser, type InsertAlbum, type InsertPhoto } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

const dbPath = "./database.sqlite";
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUser(id: string): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;
  
  // Albums
  getAllAlbums(): Album[];
  getAlbumById(id: string): Album | undefined;
  createAlbum(album: InsertAlbum): Album;
  deleteAlbum(id: string): void;
  updateAlbum(id: string, album: Partial<InsertAlbum>): Album;
  
  // Photos
  getPhotosByAlbumId(albumId: string): Photo[];
  getPhotoById(id: string): Photo | undefined;
  createPhoto(photo: InsertPhoto): Photo;
  deletePhoto(id: string): void;
}

export class DatabaseStorage implements IStorage {
  // Users
  getUser(id: string): User | undefined {
    const result = db.select().from(users).where(eq(users.id, id)).limit(1).all();
    return result[0];
  }

  getUserByUsername(username: string): User | undefined {
    const result = db.select().from(users).where(eq(users.username, username)).limit(1).all();
    return result[0];
  }

  createUser(user: InsertUser): User {
    const id = randomUUID();
    const newUser = { ...user, id };
    db.insert(users).values(newUser).run();
    return newUser as User;
  }

  // Albums
  getAllAlbums(): Album[] {
    return db.select().from(albums).orderBy(desc(albums.createdDate)).all();
  }

  getAlbumById(id: string): Album | undefined {
    const result = db.select().from(albums).where(eq(albums.id, id)).limit(1).all();
    return result[0];
  }

  createAlbum(album: InsertAlbum): Album {
    const id = randomUUID();
    const now = new Date();
    const newAlbum = {
      ...album,
      id,
      createdDate: now,
    };
    db.insert(albums).values(newAlbum).run();
    return newAlbum as Album;
  }

  deleteAlbum(id: string): void {
    db.delete(albums).where(eq(albums.id, id)).run();
  }

  updateAlbum(id: string, album: Partial<InsertAlbum>): Album {
    db.update(albums).set(album).where(eq(albums.id, id)).run();
    const updated = this.getAlbumById(id);
    if (!updated) throw new Error("Album not found after update");
    return updated;
  }

  // Photos
  getPhotosByAlbumId(albumId: string): Photo[] {
    return db.select().from(photos).where(eq(photos.albumId, albumId)).orderBy(desc(photos.uploadDate)).all();
  }

  getPhotoById(id: string): Photo | undefined {
    const result = db.select().from(photos).where(eq(photos.id, id)).limit(1).all();
    return result[0];
  }

  createPhoto(photo: InsertPhoto): Photo {
    const id = randomUUID();
    const now = new Date();
    const newPhoto = {
      ...photo,
      id,
      uploadDate: now,
    };
    db.insert(photos).values(newPhoto).run();
    return newPhoto as Photo;
  }

  deletePhoto(id: string): void {
    db.delete(photos).where(eq(photos.id, id)).run();
  }
}

// File storage utilities
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const getAlbumUploadDir = (albumId: string) => path.join(UPLOADS_DIR, "albums", albumId);
export const getOriginalsDir = (albumId: string) => path.join(getAlbumUploadDir(albumId), "originals");
export const getThumbnailsDir = (albumId: string) => path.join(getAlbumUploadDir(albumId), "thumbnails");

export async function ensureUploadDirs(albumId: string): Promise<void> {
  const originalsDir = getOriginalsDir(albumId);
  const thumbnailsDir = getThumbnailsDir(albumId);
  await fs.mkdir(originalsDir, { recursive: true });
  await fs.mkdir(thumbnailsDir, { recursive: true });
}

export async function savePhotoFile(albumId: string, photoId: string, originalName: string, buffer: Buffer): Promise<string> {
  await ensureUploadDirs(albumId);

  const ext = path.extname(originalName).toLowerCase();
  // Always save as .jpg for consistency and better compression
  const filename = `${photoId}.jpg`;
  const originalPath = path.join(getOriginalsDir(albumId), filename);

  // Compress and resize original to web-optimized size
  await sharp(buffer)
    .resize(1600, 1600, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 85, progressive: true })
    .toFile(originalPath);

  // Generate thumbnail
  const thumbnailPath = path.join(getThumbnailsDir(albumId), filename);
  await sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return filename;
}

export async function deletePhotoFile(albumId: string, filename: string): Promise<void> {
  const originalPath = path.join(getOriginalsDir(albumId), filename);
  const thumbnailPath = path.join(getThumbnailsDir(albumId), filename);
  
  await Promise.all([
    fs.unlink(originalPath).catch(() => {}),
    fs.unlink(thumbnailPath).catch(() => {}),
  ]);
}

export async function deleteAlbumFiles(albumId: string): Promise<void> {
  const albumDir = getAlbumUploadDir(albumId);
  await fs.rm(albumDir, { recursive: true, force: true });
}

export async function initializeDatabase(): Promise<void> {
  // Create uploads directory
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  // Create tables using SQL directly (simpler than migrations for initial setup)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_date INTEGER NOT NULL,
      cover_photo_id TEXT
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      album_id TEXT NOT NULL,
      upload_date INTEGER NOT NULL,
      file_size INTEGER NOT NULL,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );
  `);

  // Add cover_photo_id column if it doesn't exist (migration for existing databases)
  try {
    sqlite.exec(`ALTER TABLE albums ADD COLUMN cover_photo_id TEXT;`);
  } catch (error: any) {
    // Ignore error if column already exists
    if (!error.message.includes("duplicate column name")) {
      console.error("Error adding cover_photo_id column:", error);
    }
  }

  // Seed default admin user if it doesn't exist
  // Use a direct SQL query to check for existing admin user for reliability
  const existingAdminCheck = sqlite.prepare("SELECT COUNT(*) as count FROM users WHERE username = ?").get("admin") as { count: number };

  if (existingAdminCheck.count === 0) {
    const passwordHash = await bcrypt.hash("admin", 10);
    const id = randomUUID();

    try {
      sqlite.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").run(id, "admin", passwordHash);
    } catch (error: any) {
      // Ignore error if user already exists (race condition protection)
      if (!error.message.includes("UNIQUE constraint failed")) {
        throw error;
      }
    }
  }
}

export const storage = new DatabaseStorage();
