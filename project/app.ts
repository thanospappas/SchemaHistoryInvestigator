import * as path from 'path';
import * as express from 'express';
//import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import {ProjectRouter} from './controllers/routes/ProjectRouter';
import {SManager} from "./models/db-controllers/Project";
import "reflect-metadata";
import {BuildRouter} from "./controllers/routes/BuildRouter";
import {ReleaseRouter} from "./controllers/routes/ReleaseRouter";
import {IndexRouter} from "./controllers/routes/IndexRouter";
import {FilesAffectedRouter} from "./controllers/routes/FilesAffectedRouter";
import {DatabaseConnection} from "./models/DatabaseConnection";
import {ApiRouter} from "./controllers/routes/ApiRouter";
import {CommitRouter} from "./controllers/routes/CommitRouter";
import {RouteManager} from "./controllers/routes/RouteManager";
import {ReleaseClassifier} from "./models/Classifier/ReleaseClassifier";
import {CommitClassifier} from "./models/Classifier/CommitClassifier";
// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express: express.Application;
    public db;
    routeManager:RouteManager;

    //Run configuration methods on the Express instance.
    constructor() {
        this.db = new DatabaseConnection();
        this.express = express();
        this.middleware();
        this.routes();
        this.setViews();

        let classifier = new ReleaseClassifier();
        let commitClassifier = new CommitClassifier();
        //classifier.readReleases();
        //commitClassifier.readCommits();

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
        this.routeManager = new RouteManager(this.db);
        this.routeManager.createRoutes(this.express);
    }

}

export default new App().express;