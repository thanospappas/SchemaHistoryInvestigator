"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var express = require("express");
//import * as logger from 'morgan';
var bodyParser = require("body-parser");
require("reflect-metadata");
var DatabaseConnection_1 = require("./models/DatabaseConnection");
var RouteManager_1 = require("./controllers/routes/RouteManager");
// Creates and configures an ExpressJS web server.
var App = (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.express = express();
        this.middleware();
        this.routes();
        this.setViews();
        this.db = new DatabaseConnection_1.DatabaseConnection();
    }
    App.prototype.setViews = function () {
        this.express.set('views', path.join(__dirname + '/app/views'));
        this.express.set('view engine', 'html');
        this.express.engine('html', require('ejs').renderFile);
        this.express.use(express.static(path.join(__dirname, '/app/bower_components')));
        this.express.use('/public', express.static(path.join(__dirname, '/app/public')));
        this.express.use('/mod', express.static(path.join(__dirname, '../node_modules/')));
        this.express.use('/ngapp', express.static(path.join(__dirname, '/app/')));
        //this.express.set('view engine', 'html');
    };
    // Configure Express middleware.
    App.prototype.middleware = function () {
        //this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    };
    // Configure API endpoints.
    App.prototype.routes = function () {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        var router = express.Router();
        // placeholder route handler
        router.get('/', function (req, res, next) {
            res.send('<h1>Hello World!</h1>');
        });
        this.routeManager = new RouteManager_1.RouteManager();
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
    };
    return App;
}());
exports.default = new App().express;
//# sourceMappingURL=app.js.map