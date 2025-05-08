import { pgTable, varchar, text, json, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const assignIssues = pgTable("assignIssues", {
	projectName: varchar({ length: 256 }),
	contributor: varchar("Contributor", { length: 256 }),
	issue: varchar({ length: 256 }),
	imageUrl: varchar("image_url", { length: 256 }),
	name: varchar({ length: 256 }),
	description: text(),
});

export const completedIssues = pgTable("completedIssues", {
	projectName: varchar({ length: 256 }),
	contributor: varchar("Contributor", { length: 256 }),
	issue: varchar({ length: 256 }),
	imageUrl: varchar("image_url", { length: 256 }),
	name: varchar({ length: 256 }),
	description: text(),
});

export const pendingReview = pgTable("pendingReview", {
	projectName: varchar({ length: 256 }),
	contributor: varchar("Contributor", { length: 256 }),
	issue: varchar({ length: 256 }),
	imageUrl: varchar("image_url", { length: 256 }),
	name: varchar({ length: 256 }),
	description: text(),
});

export const projects = pgTable("projects", {
	id: varchar({ length: 256 }).primaryKey().notNull(),
	aiDescription: text("AI Description"),
	projectOwner: varchar("ProjectOwner", { length: 256 }),
	shortDescription: text("Short Description"),
	longDescription: text("Long Description"),
	imageUrl: varchar("image_url", { length: 256 }),
	repository: varchar("Repository", { length: 256 }),
	issues: varchar({ length: 256 }),
	maintainers: json(),
	rewardAmount: varchar({ length: 256 }),
	difficulty: varchar("Difficulty", { length: 256 }),
	priority: varchar({ length: 256 }),
});

export const users = pgTable("users", {
	id: varchar({ length: 256 }).primaryKey().notNull(),
	fullName: text("full_name"),
	metaMaskWalletAddress: varchar("MetaMask Wallet Address", { length: 256 }),
	email: varchar({ length: 256 }),
});

export const assignedIssues = pgTable("assignedIssues", {
	projectName: varchar({ length: 256 }),
	contributor: varchar("Contributor", { length: 256 }),
	issue: varchar({ length: 256 }),
	imageUrl: varchar("image_url", { length: 256 }),
	name: varchar({ length: 256 }),
	description: text(),
	projectOwner: varchar({ length: 256 }),
	id: uuid().defaultRandom().primaryKey().notNull(),
});

export const rewards = pgTable("rewards", {
	projectName: varchar({ length: 256 }),
	contributor: varchar("Contributor", { length: 256 }),
	issue: varchar({ length: 256 }),
	value: varchar({ length: 256 }),
	date: varchar({ length: 256 }),
});
