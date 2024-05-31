
import { pizza } from '../../db/schema';
import { db } from '../db'

const invalid_elements = item => item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0);

function index(req: Request, res: Response) {
    db.query.pizza.findMany({
        where: (pizza, { eq }) => (eq(pizza.enabled, true)),
    }).then((result) => {
        res.send(result.filter(invalid_elements).map((pizz) => {
            return {
                id: pizz.id,
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

function replace(req: Request, res: Response, id: int) {
    res.status(404).end();// TODO: not yet
}

export default { index, range, show, destroy, create, replace };