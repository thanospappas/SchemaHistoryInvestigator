import {ApiRouter} from "./ApiRouter";
import {ProjectRouter} from "./ProjectRouter";
import {BuildRouter} from "./BuildRouter";
import {ReleaseRouter} from "./ReleaseRouter";
import {IndexRouter} from "./IndexRouter";
import {FilesAffectedRouter} from "./FilesAffectedRouter";
import {CommitRouter} from "./CommitRouter";
import * as express from 'express';
import {IssueRouter} from "./IssueRouter";
import {AuthorsRouter} from "./ProjectStatsRouter";
import {TransitionRouter} from "./TransitionRouter";
/**
 * Created by thanosp on 17/4/2017.
 */

export class RouteManager{

    private routes:Array<ApiRouter>;
    database;

    constructor(){
        this.routes = new Array<ApiRouter>();
    }

    createRoutes(expressApp: express.Application){
        let prouter = new ProjectRouter();
        let irouter = new IndexRouter();

        this.routes.push(new BuildRouter());
        this.routes.push(new ReleaseRouter());
        this.routes.push(new FilesAffectedRouter());
        this.routes.push(new CommitRouter(true));
        this.routes.push(new IssueRouter());
        this.routes.push(new AuthorsRouter());
        this.routes.push(new TransitionRouter());

        prouter.init();
        irouter.init();

        for(let r of this.routes) {
            prouter.router.use(r.getPath(), r.router);
            r.init();
        }

        expressApp.use('/', irouter.irouter);
        expressApp.use('/api/v1/projects', prouter.router);


    }

}