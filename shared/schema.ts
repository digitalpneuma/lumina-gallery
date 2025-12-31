import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const albums = sqliteTable("albums", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdDate: integer("created_date", { mode: "timestamp" }).notNull(),
  coverPhotoId: text("cover_photo_id"),
});

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  albumId: text("album_id").notNull().references(() => albums.id, { onDelete: "cascade" }),
  uploadDate: integer("upload_date", { mode: "timestamp" }).notNull(),
  fileSize: integer("file_size").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  passwordHash: true,
});

export const insertAlbumSchema = createInsertSchema(albums).pick({
  name: true,
  description: true,
  coverPhotoId: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  filename: true,
  originalName: true,
  albumId: true,
  fileSize: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
