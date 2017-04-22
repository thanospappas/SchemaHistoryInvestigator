/**
 * Created by thanosp on 9/4/2017.
 */

import * as Promise from "bluebird";
import {isUndefined} from "util";
import {promise} from "selenium-webdriver";




export class SManager {

    public db;

    constructor() {

        var path = require("path");
        var sqlite3 = require('sqlite3').verbose();
        var file = path.join(__dirname, '../database/schemaEvolutionDB_new.db') ;
        this.db = new sqlite3.Database(file);

    }

    public getProjects():Promise<any>{
        var projects = [];
        return new Promise((resolve) => {
            this.db.all("SELECT * FROM Projects", function (err, rows) {
                for (let row of rows) {
                    projects.push({ID: row.PRJ_ID, Name: row.PRJ_NAME});
                }
                resolve(projects);
            });
        });
    }

    public getBranches(projectID:number):Promise<any>{
        return new Promise((resolve,reject) => {
            this.db.all("SELECT * FROM Branches WHERE BR_PRJ_ID=" + projectID, function (err, rows) {
                if (rows){
                    resolve(rows);
                }
                else{
                    reject("404");
                }
            });
        });
    }

    public getBuilds(projectID:number):Promise<any>{
        console.log(projectID);
        return new Promise((resolve,reject) => {
            this.db.all("SELECT * FROM Branches,Builds WHERE BR_PRJ_ID=" + projectID + " AND BR_NAME='master' AND BU_BRANCH_ID=BR_ID;", function (err, rows) {
                if (rows){
                    resolve(rows);
                }
                else{
                    reject("404");
                }
            });
        });
    }

    public getFilesAffected(projectID:number):Promise<any>{
        //TODO Create a view for this
        return new Promise((resolve,reject) => {
            this.db.all("SELECT FA_NEW_NAME, COUNT(Files_Affected.FA_NEW_NAME) AS Ranked FROM Projects, Branches, Commits, Files_Affected WHERE Projects.PRJ_ID = "
            + projectID + " AND Projects.PRJ_ID = Branches.BR_PRJ_ID AND Branches.BR_NAME = 'master' AND Branches.BR_ID = Commits.CO_BRANCH_ID " +
                "AND Commits.CO_ID = Files_Affected.FA_COMMIT_ID GROUP BY Files_Affected.FA_NEW_NAME ORDER BY Ranked DESC;", function (err, rows) {
                if (rows){
                    resolve(rows);
                }
                else{
                    reject("404");
                }
            });
        });
    }


    closeDB(){
        this.db.close();
    }

}