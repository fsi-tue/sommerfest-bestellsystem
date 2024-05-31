import { NextFunction, Request, Response } from "express";
import { Result, header, validationResult } from "express-validator";
import { db } from "../db";
import { auth_bearer_tokens } from "../../db/schema";
import moment from 'moment';

export const myRequestHeaders = [
    header('authorization')
        .exists({ checkFalsy: true })
        .withMessage("Missing Authorization Header")
        .bail() // not necessary, but it stops execution if previous validation failed
        .contains("Bearer")
        .withMessage("Authorization Token is not Bearer")
];

function validateHasBearer(req: Request, res: Response, next: NextFunction) {
    const validationErrors = validationResult(req);
    const errorMessages = [];

    for (const e of validationErrors.array()) {
        errorMessages.push(e.msg);
    }

    if (!validationErrors.isEmpty()) {
        return res.status(403).json({ "errors": errorMessages });
    }
    next();
}

export function validateBearer(req: Request, res: Response, next: NextFunction) {
    // myRequestHeaders
    return validateHasBearer(req, res, () => {
        // now we check the bearer if its good
        const userBearer: string = "test"; //TODO: change to real token?
        return db.query.auth_bearer_tokens.findFirst({
            where: (auth_bearer_tokens, { eq }) => (eq(auth_bearer_tokens.token, userBearer)),
        }).then((result) => {
            if (moment(result?.expiresAt) > moment()) {
                next();
            }
            else {
                return res.status(403).send("missing a valid bearer").end();
                //dude no. not authenticated, not even an error message,
                //someone is testing our api?
            }
        });
    });
}