import { pgTable, varchar, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: varchar({ length: 256 }).primaryKey().notNull(),
	fullName: text("full_name"),
	metaMaskWalletAddress: varchar("MetaMask Wallet Address", { length: 256 }),
	email: varchar({ length: 256 }),
});
