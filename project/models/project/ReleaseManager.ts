/**
 * Created by thanosp on 11/4/2017.
 */

import * as Promise from "bluebird";
import {Commit} from "./Commit";
import {Release} from "./Release";
import {ReleaseStats} from "../schema-history/ReleaseStats";

export class ReleaseManager {

    public db;

    constructor() {

        var path 	  = require("path");
        var sqlite3 = require('sqlite3').verbose();
        var file = path.join(__dirname, '../database/schemaEvolutionDB.db') ;
        this.db = new sqlite3.Database(file);

    }

    public getBranchId(projectID:number):Promise<any>{
        return new Promise((resolve) => {
            this.db.all("SELECT * FROM Branches WHERE BR_PRJ_ID = " + projectID +" AND BR_NAME='master'", function (err, rows) {
                resolve(rows);
            });
        });
    }

    private assignStatsValue(stats:ReleaseStats, type:string, value:number) {
        if (type ==("oldT")) {
            stats.setOldTables(value + stats.getOldTables());
        } else if (type==("newT")) {
            stats.setNewTables(value + stats.getNewTables());
        } else if (type==("tDel")) {
            stats.setTableDeletions(value + stats.getTableDeletions());
        } else if (type==("tIns")) {
            stats.setTableInsertions(value + stats.getTableInsertions());
        } else if (type==("aDel")) {
            stats.setAttributeDeletionsAtExistingTables(value + stats.getAttributeDeletionsAtExistingTables());
        } else if (type==("aIns")) {
            stats.setAttributeInsertionsAtExistingTables(value + stats.getAttributeInsertionsAtExistingTables());
        } else if (type==("aTabDel")) {
            stats.setAttributesDeletedAtDeletedTables(value + stats.getAttributesDeletedAtDeletedTables());
        } else if (type==("aTabIns")) {
            stats.setAttributesInsertedAtNewTables(value + stats.getAttributesInsertedAtNewTables());
        } else if (type==("aTypeAlt")) {
            stats.setAttributeTypeAlternations(value + stats.getAttributeTypeAlternations());
        } else if (type==("keyAlt")) {
            stats.setKeyAlternations(value + stats.getKeyAlternations());
        } else if (type==("newA")) {
            stats.setNewAttributes(value + stats.getNewAttributes());
        } else if (type==("oldA")) {
            stats.setOldAttributes(value + stats.getOldAttributes());
        }
    }

    public getReleases(projectID:number):Promise<any>{
        let releases:Array<Release> = new Array;
        let currentPointer = this;
            return new Promise((resolve) => {
                this.db.all("SELECT * FROM Phases WHERE BR_ID=" + projectID + " ORDER BY CO_DATE ASC;", function (err, rows) {
                    let i =0;
                    let releaseStats:ReleaseStats = new ReleaseStats();

                    for(let row of rows){
                        let found = false;
                        let rel:Release = new Release();
                        for(let r of releases){
                            if(r.name == row.RE_NAME){
                                rel = r;
                                found = true;
                            }
                        }
                        if(i % 12 == 0){

                            if(found){
                                currentPointer.assignStatsValue(rel.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                                rel.commitNumber++;
                            }
                            else{
                                let release:Release = new Release();
                                if(row.CO_PREV_RELEASE_ID == null){
                                    release.name = "Start_Of_Project";
                                    release.startDate = row.CO_DATE;
                                }
                                else{
                                    release.name = row.RE_NAME;
                                    release.startDate = row.RE_DATE;
                                }
                                release.oldestCommitDate = row.CO_DATE;
                                release.startDateHuman = new Date(parseInt(row.RE_DATE)*1000);

                                currentPointer.assignStatsValue(release.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                                release.commitNumber = 1;
                                releases.push(release);
                            }

                            releaseStats = new ReleaseStats();
                        }
                        else if(i % 12 == 11){
                            rel.newestCommitDate = row.CO_DATE;
                        }
                        else{
                            currentPointer.assignStatsValue(rel.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                        }
                        i++;
                    }
                    resolve(releases);
                });
            });
    }



    closeDB(){
        this.db.close();
    }



}
