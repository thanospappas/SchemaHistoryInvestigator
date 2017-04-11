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
        //this.router.use('/:id/builds', BuildRouter);
        //this.init();
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
    /**
     * GET all branches using project's id
     */
    ProjectRouter.prototype.getBranches = function (req, res, next) {
        var query = parseInt(req.params.id);
        //let hero = Projects.find(hero => hero.id === query);
        var prjManager = new Project_1.SManager();
        console.log(query);
        console.log("haha");
        prjManager.getBranches(query)
            .then(function (result) {
            res.status(200)
                .send({
                message: 'Success',
                status: res.status,
                result: result
            });
            //res.json(result);
        })
            .catch(function (result) {
            res.status(404)
                .send({
                message: 'No branches found with the given project id.',
                status: res.status
            });
        });
    };
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    ProjectRouter.prototype.init = function () {
        this.router.get('/', this.getAll);
        //this.router.get('/:id', this.getSingleProject);
        this.router.get('/:id', this.getBranches);
    };
    return ProjectRouter;
}());
exports.ProjectRouter = ProjectRouter;
// Create the ProjectRouter, and export its configured Express.Router
//const projectRoutes = new ProjectRouter();
//projectRoutes.init();
//export default projectRoutes.router; 
//# sourceMappingURL=ProjectRouter.js.map