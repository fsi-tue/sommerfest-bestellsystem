import express from 'express';
import cors from 'cors'

// Connect to the mongo database
import mongodb from './db.mongo';
// Import routes
import { index, login, logout } from "./routes";
import timeline from "./routes/timeline";
import ordersRouter from "./routes/orders";
import pizzaRouter from "./routes/pizza";
import { fillDb } from "./fillDb.mongo";
import { constants } from "../config/config";


mongodb();

export const app = express();
export const appPort = process.env.PORT || 3000;

////////////////////////
// Middleware

// CORS
app.use(cors({ origin: true, credentials: true, methods: ['GET', 'POST', 'PUT'] }));

// JSON parser
app.use(express.json());

// Rate limiting
/* const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // TODO: change from memory to redis/memcached
    // store: ... , // Redis, Memcached, etc. See below.
})
app.use(limiter) */

// Handle Resources
// TODO: What does this do?
// addResourceFunction(app);

////////////////////////
// Routes

// Index
app.get('^/$', index);

// Login
app.get('^/api/login$', (req, res) => res.send("pls post"));
app.post('^/api/login$', login);
app.get('^/api/logout$', logout);

// Timeline
app.get('^/timeline', timeline.timeline);

// Orders routes
app.get('/orders', ordersRouter.getAll);
app.use('/orders/:id', ordersRouter.getById);
app.post('/orders', ordersRouter.create);
app.put('/orders', ordersRouter.update);

// Pizzas routes
app.get('^/pizzas', pizzaRouter.getAll);

if(constants.ENABLE_DB_FILLING) {
    // Database filling
    app.get('^/fill', async (req, res) => {
        await fillDb();
        res.send('Database filled');
    });
}
else{
    // Database filling
    app.get('^/fill', async (req, res) => {
        res.send('disabled');
    });
}