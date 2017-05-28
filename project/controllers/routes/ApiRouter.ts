/**
 * Created by thanosp on 17/4/2017.
 */
import {Router, Request, Response, NextFunction} from 'express';

export interface ApiRouter{

    router: Router;

    init();
    getAll(req: Request, res: Response, next: NextFunction, routerObject:any);
    getSingle(req: Request, res: Response, next: NextFunction, routerObject:any);

    getPath():string;

}