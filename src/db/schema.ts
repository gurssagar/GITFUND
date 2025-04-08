
import { pgTable,json, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: varchar('id',{ length: 256 }).primaryKey(),
  fullName: text('full_name'),
  metaMask: varchar('MetaMask Wallet Address', { length: 256 }),
  email: varchar('email', { length: 256 }),
});

export const projects = pgTable('projects', {
  projectName: varchar('id',{ length: 256 }).primaryKey(),
  aiDescription: text('AI Description'),
  projectOwner: varchar('ProjectOwner', { length: 256 }),
  shortdes: text('Short Description'),
  longdis: text('Long Description'),
  image_url: varchar('image_url', { length: 256 }),
  project_repository: varchar('Repository', { length: 256 }),
  project_issues:varchar('issues', { length: 256 }),
  contributors:json('maintainers'),
  rewardAmount: varchar('rewardAmount', { length: 256 }),

});

export const assignIssues = pgTable('assignIssues', {
  projectName: varchar('projectName',{ length: 256 }),
  Contributor_id: varchar('Contributor', { length: 256 }),
  issue: varchar('issue', { length: 256 }),
  image_url: varchar('image_url', { length: 256 }),
  name: varchar('name', { length: 256 }),
  description: text('description'),
});


