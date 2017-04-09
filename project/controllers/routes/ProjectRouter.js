/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Projects = require('../../public/assets/data.json');
var ProjectRouter = (function () {
    /**
     * Initialize the ProjectRouter
     */
    function ProjectRouter() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * GET all projects.
     */
    ProjectRouter.prototype.getAll = function (req, res, next) {
        res.send(Projects);
    };
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    ProjectRouter.prototype.init = function () {
        this.router.get('/', this.getAll);
    };
    return ProjectRouter;
}());
exports.ProjectRouter = ProjectRouter;
// Create the ProjectRouter, and export its configured Express.Router
var projectRoutes = new ProjectRouter();
projectRoutes.init();
exports.default = projectRoutes.router;
//# sourceMappingURL=ProjectRouter.js.map