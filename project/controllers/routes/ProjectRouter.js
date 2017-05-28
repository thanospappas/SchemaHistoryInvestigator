/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Project_1 = require("../../models/db-controllers/Project");
//const Projects = require('../../public/assets/data.json');
var ProjectRouter = (function () {
    /**
     * Initialize the ProjectRouter
     */
    function ProjectRouter(databaseController) {
        this.router = express.Router();
        this.prjManager = new Project_1.SManager(databaseController);
    }
    /**
     * GET all projects.
     */
    ProjectRouter.prototype.getAll = function (req, res, next, thisObject) {
        thisObject.prjManager.getProjects()
            .then(function (result) {
            res.json(result);
        });
    };
    ProjectRouter.prototype.getSingle = function () {
        throw new Error('Method not implemented.');
    };
    ProjectRouter.prototype.getPath = function () {
        return "/api/v1/projects";
    };
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    ProjectRouter.prototype.init = function () {
        var _this = this;
        this.router.get('/', function (req, res, next) {
            return _this.getAll(req, res, next, _this);
        });
    };
    return ProjectRouter;
}());
exports.ProjectRouter = ProjectRouter;
//# sourceMappingURL=ProjectRouter.js.map