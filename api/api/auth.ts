import { Request, Response } from 'express';
import { body, validationResult } from "express-validator";
import { constants, tokens } from "../config/config";
import rateLimit from "express-rate-limit";
const moment = require('moment-timezone');
const crypto = require('crypto');

/**
 * Check if the request is authenticated
 * @param req
 * @param res
 */
export async function checkAuth(req: Request, res: Response) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Bearer token missing' });
    }

    // Retrieve the token list from the app context
    const tokenlist = req.app.get("tokenlist") || [];
    const tokenEntry = tokenlist.find((entry: any) => entry.token === token);

    if (!tokenEntry) {
        return res.status(403).json({ message: 'Invalid token' });
    }

    // Check if the token has expired
    if (moment().isAfter(tokenEntry.expiresAt)) {
        return res.status(403).json({ message: 'Token has expired' });
    }
}

/**
 * Rate limiter for login requests
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes",
    validate: false,
});

/**
 * POST /login
 * Login endpoint
 */
export const login = [
    loginRateLimiter,
    body('token').isString().notEmpty().withMessage('Token is required'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.body;
        const bearer = { token: '', expires: 0 };

        try {
            // Validate token
            const correct_token: string = process.env.PAYMENT_ADMIN_TOKEN || tokens.PAYMENT_ADMIN_TOKEN;
            if (!correct_token) {
                return res.status(500).json({ message: 'Server configuration error' });
            }

            if (token === correct_token) {
                const expires: Date = moment().add(constants.LIFETIME_BEARER_HOURS, "hours").toDate();
                const newToken = crypto.randomBytes(64).toString('hex');

                const inserted = [{
                    expiresAt: expires,
                    token: newToken,
                    userId: 1, // admin
                }];

                const tokenlist_orig = req.app.get("tokenlist") || [];
                req.app.set("tokenlist", tokenlist_orig.concat(inserted));

                if (inserted.length === 1) {
                    // Create a new bearer
                    bearer.token = inserted[0].token;
                    bearer.expires = moment(inserted[0].expiresAt).unix();
                }
            } else {
                return res.status(403).json({ message: 'Invalid token' });
            }

            if (bearer.expires > 0) {
                res.json(bearer);
            } else {
                res.status(403).end();
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server ErrorMessage' });
        }
    }
];

/**
 * POST /logout
 * Logout endpoint
 */
export const logout = (req: Request, res: Response) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Remove the token from the token list
        const updatedTokenList = (req.app.get("tokenlist") || []).filter((t: { token: string; }) => t.token !== token);
        req.app.set("tokenlist", updatedTokenList);

        res.send("Logout successful");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server ErrorMessage' });
    }
};
