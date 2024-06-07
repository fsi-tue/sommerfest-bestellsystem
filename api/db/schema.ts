// src/model.ts

import { sql } from "drizzle-orm";
import { pgTable, pgEnum, serial, text, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: serial("id").primaryKey(),
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

export const payment = pgTable("payment", {
    id: serial("id").primaryKey(),
});

export const orderStateEnum = pgEnum('orderState', [
    'open', 'paid', 'delivered'
]);

export const pizza_order_map = pgTable("pizza_order_map", {
    orderid: integer("orderid"),
    pizza: integer("pizza"),
});

//orders

export const collected_order = pgTable("collected_order", {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const waiting_order = pgTable("waiting_order", {
    id: serial("id").primaryKey(),
    collectedorder: integer("collectedorder").references(() => collected_order.id),

    time_left: real("time_left"),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const paid_order = pgTable("paid_order", {
    id: serial("id").primaryKey(),
    // references open order id because 
    waitingorder: integer("waitingorder").references(() => waiting_order.id),
    paymentid: integer("paymentid").references(() => payment.id).notNull(),

    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const open_order = pgTable("open_order", {
    id: serial("id").primaryKey(),
    name: text("name"),
    paidorder: integer("paidorder").references(() => paid_order.id),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});


//bearer tokens
export const auth_bearer_tokens = pgTable('auth_bearer_tokens', {
    id: serial("id").primaryKey(),
    userId: integer("userid").references(() => user.id).notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires").notNull().default(sql`now() + interval '8 hours'`),
});
