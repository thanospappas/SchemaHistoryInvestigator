import * as path from 'path';
import * as express from 'express';
//import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import {ProjectRouter} from './controllers/routes/ProjectRouter';
import {SManager} from "./models/project/Project";
import "reflect-metadata";
import {BuildRouter} from "./controllers/routes/BuildRouter";
import {ReleaseRouter} from "./controllers/routes/ReleaseRouter";
import {IndexRouter} from "./controllers/routes/IndexRouter";
import {FilesAffectedRouter} from "./controllers/routes/FilesAffectedRouter";
import {DatabaseConnection} from "./models/DatabaseConnection";
import {ApiRouter} from "./controllers/routes/ApiRouter";
import {CommitRouter} from "./controllers/routes/CommitRouter";
import {RouteManager} from "./controllers/routes/RouteManager";
// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express: express.Application;
    public db;
    apiRouter;
    routeManager:RouteManager;

    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.setViews();
        this.db = new DatabaseConnection();
    }

    private setViews(): void{
        this.express.set('views', path.join(__dirname + '/app/views'));
        this.express.set('view engine', 'html');
        this.express.engine('html', require('ejs').renderFile);
        this.express.use(express.static(path.join(__dirname, '/app/bower_components')));
        this.express.use('/public',express.static(path.join(__dirname, '/app/public')));
        this.express.use('/mod', express.static(path.join(__dirname, '../node_modules/')));
        this.express.use('/ngapp', express.static(path.join(__dirname, '/app/')))
        //this.express.set('view engine', 'html');
    }

    // Configure Express middleware.
    private middleware(): void {
        //this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    // Configure API endpoints.
    private routes(): void {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        let router = express.Router();
        // placeholder route handler
        router.get('/', (req, res, next) => {
            res.send('<h1>Hello World!</h1>');
        });
        this.routeManager = new RouteManager();
        this.routeManager.createRoutes(this.express);


        //let prouter = new ProjectRouter();
        //let brouter = new BuildRouter();
        //let rrouter = new ReleaseRouter();
        //let irouter = new IndexRouter();
        //let farouter = new FilesAffectedRouter();

        //this.apiRouter = new ReleaseCommitRouter(true);

        //prouter.router.use('/:id/builds', brouter.brouter);
        //prouter.router.use('/:id/releases',rrouter.rrouter);
        //prouter.router.use('/:id/files_affected',farouter.farouter);
        //prouter.router.use('/:id/commits',this.apiRouter.router);

        //prouter.init();
        //brouter.init();
        //rrouter.init();
        //irouter.init();
        //farouter.init();

        //this.apiRouter.init();

        //this.express.use('/', irouter.irouter);
        //this.express.use('/api/v1/projects', prouter.router);
        //this.express.use("/", router);

    }

}

export default new App().express;