import { Request, Response } from "express";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Database
const { connectDb } = require("./db/db.mongo")

const { fillDb } = require("./db/fillDb.mongo")
const { constants } = require("./config")

// Routes
const { login, logout } = require('./auth');
const { getTimeline } = require("./getTimeline")
const { createOrder, getAllOrders, getOrderById, updateOrder } = require("./order")
const { createPizza, getAllPizzas, updatePizza } = require("./pizza")

connectDb();

const app = express();
const appPort = process.env.PORT || 3000;

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

module.exports = app;
