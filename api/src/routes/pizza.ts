import {db} from '../db'


function index(req: Request, res: Response) {
    db.query.pizza.findMany().then((result) => {
        res.send(result.map((pizz) => {
            return {
                name: pizz.name,
                price: pizz.price
            };
        }));
    });
}

function range(req: Request, res: Response, a: int, b: int, format: string) {
    res.send('list range orders');
}

function show(req: Request, res: Response, id: int) {
    res.send('list one')
}

function destroy(req: Request, res: Response, id: int) {
    res.send('delete one');
}

function create(req: Request, res: Response) {
    //no.
}

export default {index, range, show, destroy, create};
