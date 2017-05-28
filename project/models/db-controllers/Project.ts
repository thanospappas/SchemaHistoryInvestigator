/**
 * Created by thanosp on 9/4/2017.
 */

import * as Promise from "bluebird";
import {isUndefined} from "util";
import {promise} from "selenium-webdriver";
import {DatabaseController} from "../DatabaseController";
import {DatabaseConnection} from "../DatabaseConnection";




export class SManager{


    public database:DatabaseConnection;

    constructor(databaseController) {

        //var path = require("path");
        //var sqlite3 = require('sqlite3').verbose();
        //var file = path.join(__dirname, '../database/schemaEvolutionDB_new.db') ;
        //this.db = new sqlite3.Database(file);

        this.database = databaseController;

    }

    public getProjects():Promise<any>{
        var projects = [];
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Projects", function (err, rows) {
                for (let row of rows) {
                    projects.push({ID: row.P_ID, path: row.P_DB_PATH, Name: row.P_DB_NAME});
                }
                resolve(projects);
            });
        });
    }

    /*public getBranches(projectID:number):Promise<any>{
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
    }*/

    public getBuilds(projectID:number):Promise<any>{
        console.log(projectID);
        return new Promise((resolve,reject) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Branches,Builds WHERE BR_PRJ_ID=" + projectID + " AND BR_NAME='master' AND BU_BRANCH_ID=BR_ID;", function (err, rows) {
                if (rows){
                    resolve(rows);
                }
                else{
                    reject("404");
                }
            });
        });
    }

    /*public getFilesAffected(projectID:number):Promise<any>{
        //TODO Create a view for this
        console.log("Projectid: " + projectID);
        return new Promise((resolve,reject) => {
            this.database.getDBConnection(projectID).all("SELECT FA_NEW_NAME, COUNT(Files_Affected.FA_NEW_NAME) AS Ranked FROM Projects, Branches, Commits, Files_Affected WHERE Projects.PRJ_ID = "
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
    }*/


    closeDB(projectId){
        this.database.getDBConnection(projectId).close();
    }

}