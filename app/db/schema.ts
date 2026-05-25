import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  avatar: text("avatar"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User roles with project-level granularity
export const userRoles = mysqlTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: int("userId").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // "superadmin" | "admin" | "client"
  scope: varchar("scope", { length: 50 }).default("global").notNull(), // "global" | "project"
  projectId: int("projectId"), // NULL for global roles
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

// Two-factor authentication codes
export const twoFactorCodes = mysqlTable("two_factor_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TwoFactorCode = typeof twoFactorCodes.$inferSelect;
export type InsertTwoFactorCode = typeof twoFactorCodes.$inferInsert;

// Client uploads pending approval
export const clientUploads = mysqlTable("client_uploads", {
  id: serial("id").primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "image" | "document" | "video"
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending" | "approved" | "rejected"
  isPublic: boolean("isPublic").default(false).notNull(),
  requestedPublic: boolean("requestedPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
});

export type ClientUpload = typeof clientUploads.$inferSelect;
export type InsertClientUpload = typeof clientUploads.$inferInsert;

// Projects table for portfolio
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["Residential", "Commercial"]).default("Residential").notNull(),
  subcategory: mysqlEnum("subcategory", ["Interiors", "Exteriors"]).default("Interiors").notNull(),
  image: varchar("image", { length: 500 }).notNull(),
  video: varchar("video", { length: 500 }),
  aspect: mysqlEnum("aspect", ["16:9", "3:4", "4:5"]).default("16:9").notNull(),
  order: int("order").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Project assets: multiple images/videos per project
export const projectAssets = mysqlTable("project_assets", {
  id: serial("id").primaryKey(),
  projectId: int("projectId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["image", "video"]).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectAsset = typeof projectAssets.$inferSelect;
export type InsertProjectAsset = typeof projectAssets.$inferInsert;

// Contact submissions table
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  projectType: varchar("projectType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

// Site content CMS table
export const siteContent = mysqlTable("site_content", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 50 }).notNull().unique(),
  data: json("data").notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;
