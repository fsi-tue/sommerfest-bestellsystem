import { db } from '../db'

function index(req: Request, res: Response) {
    res.send('list all');
}
function range(req: Request, res: Response, a: int, b: int, format: string) {
    res.send('list range orders');
}
function show(req: Request, res: Response, id: int) {
    res.send('list one');
}

function destroy(req: Request, res: Response, id: int) {
    res.send('delete one');
    //no.
}

function create(req: Request, res: Response) {
    res.send({ orderNumber: Math.floor(Math.random() * 1000) });
}

export default { index, range, show, destroy, create };