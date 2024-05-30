// src/schema.ts

import { pgTable, pgEnum, serial, text, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";

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

export const open_order = pgTable("open_order", {
    id: serial("id").primaryKey(),
    name: text("name"),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const paid_order = pgTable("paid_order", {
    id: serial("id").primaryKey(),
    // references open order id because 
    order: integer("order").references(() => open_order.id).notNull(),
    paymentid: integer("paymentid").references(() => payment.id).notNull(),

    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const waiting_order = pgTable("waiting_order", {
    id: serial("id").primaryKey(),
    order: integer("order").references(() => paid_order.id).notNull(),
    time_left: real("time_left"),

    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const collected_order = pgTable("collected_order", {
    id: serial("id").primaryKey(),
    order: integer("order").references(() => waiting_order.id).notNull(),

    timestamp: timestamp("timestamp").notNull().defaultNow(),
});