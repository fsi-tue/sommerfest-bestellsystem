import express, { Request, Response } from 'express';
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import crud from 'express-crud-router';


import { validateBearer } from './middleware/auth_bearer';
import { addResourceFunction } from './middleware/resource';

import { index, login, logout } from './routes/index'
import timeline from './routes/timeline'



export const app = express();
export const app_port = process.env.PORT || 3000;

// Middleware to parse JSON bodies

//enable CORS 
app.use(cors({ origin: true, credentials: true }));
//we want to be able to parse json
app.use(express.json());
//we want to do rate limiting

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // TODO: change from memory to redis/memcached
    // store: ... , // Redis, Memcached, etc. See below.
})
// Apply the rate limiting middleware to all requests.
app.use(limiter)
//we want resource
addResourceFunction(app);

//routes
app.get('^/$', index);

app.get('^/api/login$', (req, res) => res.send("pls post"));
app.post('^/api/login$', login);
app.get('^/api/logout$', logout);

app.get('^/timeline', timeline.timeline);

app.use(crud(`/orders`, require(`./routes/orders`)));
app.use(crud(`/pizzas`, require(`./routes/pizza`)));
app.use(crud(`/payment`, require(`./routes/payment`)));


