import express, { Express, Request, Response, Application } from 'express';
import cors from 'cors'

import index from './routes/index'
import timeline from './routes/timeline'
import orders from './routes/orders';
import pizza from './routes/pizza';


export const app = express();
export const app_port = process.env.PORT || 3000;

//enable CORS 
app.use(cors({ origin: true, credentials: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Dummy users
var users = [
    { id: 0, name: 'anyone', email: '', role: '' },
    { id: 1, name: 'admin', email: '', role: 'admin' },
    { id: 2, name: 'user', email: '', role: 'user' },
];
function loadUser(req, res, next) {
    // TODO: fetch user from db
    var user = users[0];
    if (user) {
        req.user = user;
        next();
    } else {
        next(new Error('Failed to load user ' + req.params.id));
    }
}

function restrictToRole(role) {
    return function (req, res, next) {
        if (req.user.role === role) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    }
}

function forward(forwardpath: string) {
    return (req: Request, res: Response) => {
        res.location(forwardpath);
        res.send("forwarding...");
    }
}


app.resource = function (path: string, obj: any) {
    this.get(path, obj.index);
    this.get(path + '/:a..:b.:format?', function (req, res) {
        var a = parseInt(req.params.a, 10);
        var b = parseInt(req.params.b, 10);
        var format = req.params.format;
        obj.range(req, res, a, b, format);
    });
    this.get(path + '/:id', obj.show);
    this.delete(path + '/:id', function (req, res) {
        var id = parseInt(req.params.id, 10);
        obj.destroy(req, res, id);
    });
    this.post("^/order", (req, res) => {
        // create a new order
        obj.create(req, res)
    })

};

//routes
app.get('^/$', index);
app.get('^/timeline', loadUser, timeline.timeline);
app.resource('^/orders', orders);
app.resource("^/pizzas", pizza);


