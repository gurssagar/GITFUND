import {
  pgTable,
  json,
  text,
  varchar,
  timestamp,
  integer,
  unique,
  doublePrecision ,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { Tag } from "lucide-react";

// Conversations Table
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
});

// Users Table
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  fullName: text("full_name"),
  image_url: varchar("image_url", { length: 256 }),
  metaMask: varchar("MetaMask Wallet Address", { length: 256 }),
  email: varchar("email", { length: 256 }),
  Location: varchar("Location", { length: 256 }),
  Bio: text("Bio"),
  Telegram: varchar("Telegram", { length: 256 }),
  Twitter: varchar("Twitter", { length: 256 }),
  Linkedin: varchar("Linkedin", { length: 256 }),
  rating: integer("rating").default(5),
  skills: json("skills"),
});





// Messages Table
export const messages = pgTable("messages", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  text: text("text"),
  timestamp: timestamp("timestamp"),
  reciever_id: varchar("reciever_id", { length: 256 }),
  sender_id: varchar("sender_id", { length: 256 }),
});

// Participants Table
export const participants = pgTable(
  "participants",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    conversation_id: varchar("conversation_id", { length: 256 })
      .notNull()
      .references(() => conversations.id),
    user_id: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    participants_conversation_user_unique: unique(
      "participants_conversation_user_unique"
    ).on(table.conversation_id, table.user_id),
  })
);

// Issues Table
export const issues = pgTable("issues", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  issue_name: varchar("issue_name", { length: 256 }),
  publisher: varchar("publisher", { length: 256 }),
  issue_description: text("issue_description"),
  issue_date: varchar("issue_date", { length: 256 }),
  Difficulty: varchar("Difficulty", { length: 256 }),
  priority: varchar("Priority", { length: 256 }),
  project_repository: varchar("Repository", { length: 256 }),
  project_issues: varchar("issues", { length: 256 }),
  rewardAmount: varchar("rewardAmount", { length: 256 }),
});

// Project Table
export const project = pgTable("project", {
  projectName: varchar("id", { length: 256 }).primaryKey(),
  aiDescription: text("AI Description"),
  projectOwner: varchar("ProjectOwner", { length: 256 }),
  shortdes: text("Short Description"),
  longdis: text("Long Description"),
  image_url: varchar("image_url", { length: 256 }),
  project_repository: varchar("Repository", { length: 256 }),
  contributors: json("maintainers"),
  languages: json("languages"),
  stars: varchar("stars"),
  forks: varchar("forks"),
  likes: integer("likes").default(0),
  owner: json("owner"),
  comits: json("comits"),
  Tag: varchar("Tag", { length: 256 }),
});

// Projects Table
export const projects = pgTable("projects", {
  projectName: varchar("id", { length: 256 }).primaryKey(),
  aiDescription: text("AI Description"),
  projectOwner: varchar("ProjectOwner", { length: 256 }),
  shortdes: text("Short Description"),
  longdis: text("Long Description"),
  image_url: varchar("image_url", { length: 256 }),
  project_repository: varchar("Repository", { length: 256 }),
  project_issues: varchar("issues", { length: 256 }),
  contributors: json("maintainers"),
  rewardAmount: varchar("rewardAmount", { length: 256 }),
  languages: json("languages"),
  stars: varchar("stars"),
  forks: varchar("forks"),
});

// Contributor Requests Table
export const contributorRequests = pgTable("contributorRequests", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  projectName: varchar("projectName", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  contributor_email: varchar("contributor_email", { length: 256 }),
  requestDate: varchar("requestDate", { length: 256 }),
  projectOwner: varchar("projectOwner", { length: 256 }),
  skills: json("skills"),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
  status: varchar("status", { length: 256 }),
});

/**
 * Table Relations
 */

export const userRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  participants: many(participants),
}));

export const conversationRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
  participants: many(participants),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
  }),
}));

export const participantRelations = relations(participants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [participants.conversation_id],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [participants.user_id],
    references: [users.id],
  }),
}));

// The rest of your tables (pullRequests, assignIssues, assignedIssues, pendingReview, completedIssues, Rewards) remain unchanged, as they do not have foreign key constraints or relations that need correction.

export const PullRequests = pgTable("PullRequests", {
  id: varchar("id", { length: 256 }).primaryKey().default(sql`gen_random_uuid()`),
  repository: varchar("repository", { length: 256 }),
  pullRequestId: varchar("pullRequestId", { length: 256 }),
  title: text("title"),
  description: text("description"),
  status: varchar("status", { length: 256 }),
  createdAt: timestamp("createdAt").default(sql`now()`),
  rewardedAt: timestamp("rewardedAt").default(sql`now()`),
  contributorId: varchar("contributorId", { length: 256 }),
  projectName: varchar("projectName", { length: 256 }),
  rewardAmount: doublePrecision("rewardAmount"),
  issue: varchar("issue", { length: 256 }),
});
export const assignIssues = pgTable("assignIssues", {
  projectName: varchar("projectName", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
});

export const assignedIssues = pgTable("assignedIssues", {
  projectName: varchar("projectName", { length: 256 }),
  projectOwner: varchar("projectOwner", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
});

export const pendingReview = pgTable("pendingReview", {
  projectName: varchar("projectName", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
});

export const completedIssues = pgTable("completedIssues", {
  projectName: varchar("projectName", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
});

export const Rewards = pgTable("rewards", {
  projectName: varchar("projectName", { length: 256 }),
  projectDescription: text("projectDescription"),
  projectOwner: varchar("projectOwner", { length: 256 }),
  project_repository: varchar("project_repository", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  transactionHash: varchar("transactionHash", { length: 256 }),
  rewardAmount: doublePrecision("rewardAmount"),
  issue: varchar("issue", { length: 256 }),
  date: timestamp("date").default(sql`now()`),
});
