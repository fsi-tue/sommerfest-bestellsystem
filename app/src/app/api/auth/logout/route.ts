/**
 * POST /logout
 * Logout endpoint
 */
export async function POST(req: Request) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return new Response('Bearer token missing', { status: 401 });
        }

        // Remove the token from the token list
        const updatedTokenList = (req.app.get("tokenlist") || [])
            .filter((t: { token: string; }) => t.token !== token);
        req.app.set("tokenlist", updatedTokenList);

        return new Response('Logged out successfully');
    } catch (error) {
        console.error(error);
        return new Response('Error logging out', { status: 500 });
    }
}
