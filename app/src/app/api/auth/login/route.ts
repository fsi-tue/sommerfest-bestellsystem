import { constants, tokens } from "@/config";

export async function POST(req: Request) {
    const { token } = await req.json();
    if (!token) {
        return new Response('Token missing', { status: 400 });
    }
    const bearer = { token: '', expires: 0 };

    try {
        // Validate token
        const correct_token: string = process.env.PAYMENT_ADMIN_TOKEN || tokens.PAYMENT_ADMIN_TOKEN;
        if (!correct_token) {
            return new Response('Token not set', { status: 500 });
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
            return new Response('Invalid token', { status: 403 });
        }

        if (bearer.expires > 0) {
            return new Response(JSON.stringify(bearer));
        } else {
            return new Response('Error creating token', { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return new Response('Error creating token', { status: 500 });
    }
}
