import { Application, NextFunction, Request, RequestHandler, Response } from "express";

export type ResourceHandler = {
    index: RequestHandler,
    range: (req: Request, res: Response, from: number, to: number, format: string) => any,
    show: (req: Request, res: Response, id: number) => any,
    destroy: (req: Request, res: Response, id: number) => any,
    create: RequestHandler,
};

export function addResourceFunction(app: Application) {
    app.resource = function (path: string, resourceHandlerFunction: ResourceHandler, ...middleware: RequestHandler[]) {
        this.get(path, ...middleware, resourceHandlerFunction.index);
        this.get(path + '/:a..:b.:format?', ...middleware, function (req: Request, res: Response) {
            var a = parseInt(req.params.a, 10);
            var b = parseInt(req.params.b, 10);
            var format = req.params.format;
            //do we like no checking?
            resourceHandlerFunction.range(req, res, a, b, format);
        });
        this.get(path + '/:id', ...middleware, function (req: Request, res: Response) {
            var id = parseInt(req.params.id, 10);
            return resourceHandlerFunction.show(req, res, id);
        });
        this.delete(path + '/:id', ...middleware, function (req: Request, res: Response) {
            var id = parseInt(req.params.id, 10);
            resourceHandlerFunction.destroy(req, res, id);
        });
        this.post("^/order", ...middleware, function (req: Request, res: Response) {
            return resourceHandlerFunction.create(req, res);
        });
    };
}
