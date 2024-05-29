// src/schema.ts

import { pgTable, serial, text, timestamp, real, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: serial("id"),
    name: text("name"),
    email: text("email"),
    password: text("password"),
    role: text("role").$type<"admin" | "customer">(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

export const pizza = pgTable("pizza", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    price: real("price"),
    enabled: boolean("enabled"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
