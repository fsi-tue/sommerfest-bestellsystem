import moment from "moment";
import { constants, tokens } from "../../config/config";
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

export function index(req: Request, res: Response) {
    res.send('Welcome to the API');
}

export async function login(req: Request, res: Response) {
    const bearer = { token: '', expires: 0 };
    if (req.body === null) {
        res.status(403).end();
    }

    if ("token" in req.body) {
        const token: string = req.body.token as string;
        if (!token) {
            res.status(403).end();
        }

        //check token
        const correct_token: string = tokens.PAYMENT_ADMIN_TOKEN;
        if (token === correct_token) {
            const expires: Date = moment().add(constants.LIFETIME_BEARER_HOURS, "hours").toDate();
            const inserted = [{
                expiresAt: expires,
                token: uuidv4() as string,
                userId: 1, // admin
            }];
            const tokenlist_orig = req.app.get("tokenlist") || [];
            req.app.set("tokenlist", tokenlist_orig.concat(inserted))
            if (inserted.length == 1) {
                //create a new bearer
                bearer.token = inserted[0].token;
                bearer.expires = moment(inserted[0].expiresAt).unix();
            }
        }
    }

    if (bearer.expires > 0) {
        res.send(bearer);
    } else {
        res.status(403).end();
    }
}

export function logout(req: Request, res: Response) {
    res.send("logout");
}
