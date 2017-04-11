/**
 * Created by thanosp on 9/4/2017.
 */

import * as Promise from "bluebird";
import {isUndefined} from "util";


export interface StorageManager {
    //init(force?:boolean):Promise<any>;
    //register(name:string, email:string, rawPassword:string):Promise<any>;
    //getAccountById(id:number):Promise<any>;
    //getAccountByEmail(email:string):Promise<any>;

}

export class SManager implements StorageManager {

    public db;

    constructor() {

        //var env 	  = process.env.NODE_ENV || "development";
        var path 	  = require("path");
        //let config 	  = require(path.join(__dirname, '../../config/config.json'))[env];

        var sqlite3 = require('sqlite3').verbose();
        var file = path.join(__dirname, '../database/schemaEvolutionDB.db') ;
        this.db = new sqlite3.Database(file);



    }

    public getProjects():Promise<any>{
        var projects = [];
        return new Promise((resolve) => {
            this.db.all("SELECT * FROM Projects", function (err, rows) {
                for (let row of rows) {
                    console.log(row.PRJ_ID, row.PRJ_NAME);
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


    closeDB(){
        this.db.close();
    }



}