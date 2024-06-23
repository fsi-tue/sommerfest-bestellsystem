const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

import { constants } from "../config/config";
import { Request, Response } from "express";

// Database
import mongodb from '../db/db.mongo';
import { fillDb } from "../db/fillDb.mongo";

// Routes
import { login, logout } from "./auth";
import { getTimeline } from "./getTimeline";
import { createOrder, getAllOrders, getOrderById, updateOrder } from "./order";
import { createPizza, getAllPizzas, updatePizza } from "./pizza";

mongodb();

const app = express();
export const appPort = process.env.PORT || 3000;

////////////////////////
// Middleware

// CORS
app.use(cors({ origin: true, credentials: true, methods: ['GET', 'POST', 'PUT'] }));

// JSON parser
app.use(bodyParser.json());

// Index
app.get('/', (req: Request, res: Response) => res.send('Welcome to the Pizza API'));

// Login
app.post('/api/login', login);
app.get('/api/logout', logout);

// Timeline
app.get('/timeline', getTimeline);

// Order src
app.get('/orders', getAllOrders);
app.use('/orders/:id', getOrderById);
app.post('/orders', createOrder);
app.put('/orders', updateOrder)

// Pizza src
app.get('/pizzas', getAllPizzas);
app.post('/pizzas', createPizza);
app.put('/pizzas/', updatePizza);

// Database filling
if (constants.ENABLE_DB_FILLING) {
    // Database filling
    app.get('^/fill', async (req: Request, res: Response) => {
        await fillDb();
        res.send('Database filled');
    });
} else {
    // Database filling
    app.get('^/fill', async (req: Request, res: Response) => {
        res.send('disabled');
    });
}

// Start the server
app.listen(appPort, () => {
    console.log(`Listening: http://localhost:${appPort}`);
});

export default app;
