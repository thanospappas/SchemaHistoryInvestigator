/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Project_1 = require("../../models/project/Project");
//const Projects = require('../../public/assets/data.json');
var ProjectRouter = (function () {
    /**
     * Initialize the ProjectRouter
     */
    function ProjectRouter() {
        this.router = express.Router();
    }
    /**
     * GET all projects.
     */
    ProjectRouter.prototype.getAll = function (req, res, next) {
        var prjManager = new Project_1.SManager();
        //var pCust: Promise<any>;
        prjManager.getProjects()
            .then(function (result) {
            console.log("I got your answer");
            console.log(result);
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
        this.router.get('/', this.getAll);
    };
    return ProjectRouter;
}());
exports.ProjectRouter = ProjectRouter;
//# sourceMappingURL=ProjectRouter.js.map