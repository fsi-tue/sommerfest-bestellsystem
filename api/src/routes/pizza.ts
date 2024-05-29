
import db from '../config/db'

function index(req: Request, res: Response) {
    res.send([
        { name: "Margherita", price: 3 },
        { name: "Pepperoni", price: 4 },
        { name: "Vegetarian", price: 5 },
        { name: "Four Cheese", price: 7 },
    ]);
}

function range(req: Request, res: Response, a: int, b: int, format: string) {
    res.send('list range orders')
    const result = db.query('SELECT * FROM orders');
    console.log(result);
}
function show(req: Request, res: Response, id: int) {
    res.send('list one')
    const result = db.query('SELECT * FROM orders');
    console.log(result);
}

function destroy(req: Request, res: Response, id: int) {
    res.send('delete one')
    const result = db.query('SELECT * FROM orders');
    console.log(result);
}

function create(req: Request, res: Response) {
    res.send({ orderNumber: Math.floor(Math.random() * 1000) });
}

export default { index, range, show, destroy, create };