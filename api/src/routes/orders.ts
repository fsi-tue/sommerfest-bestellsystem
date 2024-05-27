import db from '../config/db'

function index(req: Request, res: Response) {
    res.send('list all')
    const result = db.query('SELECT * FROM orders');
    console.log(result);
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

export default { index, range, show, destroy };