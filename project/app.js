"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var express = require("express");
//import * as logger from 'morgan';
var bodyParser = require("body-parser");
require("reflect-metadata");
var DatabaseConnection_1 = require("./models/DatabaseConnection");
var RouteManager_1 = require("./controllers/routes/RouteManager");
var ReleaseClassifier_1 = require("./models/Classifier/ReleaseClassifier");
var CommitClassifier_1 = require("./models/Classifier/CommitClassifier");
// Creates and configures an ExpressJS web server.
var App = (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.db = new DatabaseConnection_1.DatabaseConnection();
        this.express = express();
        this.middleware();
        this.routes();
        this.setViews();
        var classifier = new ReleaseClassifier_1.ReleaseClassifier();
        var commitClassifier = new CommitClassifier_1.CommitClassifier();
        //classifier.readReleases();
        //commitClassifier.readCommits();
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
        this.routeManager = new RouteManager_1.RouteManager(this.db);
        this.routeManager.createRoutes(this.express);
    };
    return App;
}());
exports.default = new App().express;
//# sourceMappingURL=app.js.map