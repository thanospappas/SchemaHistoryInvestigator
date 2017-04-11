"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
//import * as logger from 'morgan';
var bodyParser = require("body-parser");
var ProjectRouter_1 = require("./controllers/routes/ProjectRouter");
var Project_1 = require("./models/project/Project");
require("reflect-metadata");
var BuildRouter_1 = require("./controllers/routes/BuildRouter");
var ReleaseRouter_1 = require("./controllers/routes/ReleaseRouter");
// Creates and configures an ExpressJS web server.
var App = (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.express = express();
        this.middleware();
        this.routes();
        var storageManager = new Project_1.SManager();
        //storageManager.init();
    }
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
        var prouter = new ProjectRouter_1.ProjectRouter();
        var brouter = new BuildRouter_1.BuildRouter();
        var rrouter = new ReleaseRouter_1.ReleaseRouter();
        prouter.router.use('/:id/builds', brouter.brouter);
        prouter.router.use('/:id/releases', rrouter.rrouter);
        prouter.init();
        brouter.init();
        rrouter.init();
        this.express.use('/api/v1/projects', prouter.router);
        //this.express.use("/", router);
    };
    return App;
}());
exports.default = new App().express;
//# sourceMappingURL=app.js.map