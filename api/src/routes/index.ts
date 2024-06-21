import moment from "moment";
import { constants, tokens } from "../../config/config";
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

/**
 * Rate limiter for login requests
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes"
});

/**
 * GET /
 * Welcome message
 */
export function index(req: Request, res: Response) {
    res.send('Welcome to the API');
}

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
                const newToken = crypto.randomBytes(48).toString('hex');

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
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
];

/**
 * POST /logout
 * Logout endpoint
 */
export function logout(req: Request, res: Response) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tokenlist_orig = req.app.get("tokenlist") || [];
        const updatedTokenList = tokenlist_orig.filter((t: { token: string; }) => t.token !== token);
        req.app.set("tokenlist", updatedTokenList);

        res.send("Logout successful");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
