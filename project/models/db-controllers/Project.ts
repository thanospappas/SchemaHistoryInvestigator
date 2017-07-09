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



    closeDB(projectId){
        this.database.getDBConnection(projectId).close();
    }

}