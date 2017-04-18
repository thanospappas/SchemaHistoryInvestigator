/**
 * Created by thanosp on 11/4/2017.
 */

import * as Promise from "bluebird";
import {Release} from "./Release";
import {ReleaseStats} from "../schema-history/ReleaseStats";

export class ReleaseManager {

    public db;

    constructor() {

        var path = require("path");
        var sqlite3 = require('sqlite3').verbose();
        var file = path.join(__dirname, '../database/schemaEvolutionDB_new.db') ;
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
        if (type==("tDel")) {
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
        }
        else if (type==("newT")){
            stats.setSchemaSizeTable(value + stats.getSchemaSizeTable());
        }
        else if (type==("newA")){
            stats.setSchemaSizeAttribute(value + stats.getSchemaSizeAttribute());
        }
    }

    public populateDurations(releases:Array<Release>, allReleases:Array<any>){
        for(let i = 0; i < releases.length; i++){
            for(let j = 0; j < allReleases.length; j++) {

                if(releases[i].name == "Start_Of_Project"){
                    let duration = Math.ceil((allReleases[0].startDate * 1000 - releases[i].startDate * 1000) / (1000 * 3600 * 24));
                    console.log(duration);
                    releases[i].duration = duration;
                    break;
                }
                else if (j < allReleases.length - 1 && allReleases[j].name == releases[i].name) {

                    let duration = Math.ceil((allReleases[j + 1].startDate * 1000 - releases[i].startDate * 1000) / (1000 * 3600 * 24));
                    console.log(duration);
                    releases[i].duration = duration;
                    break;
                }
            }
            releases[i].releaseMetrics.setSchemaSizeTable(1.0*releases[i].releaseMetrics.getSchemaSizeTable()/releases[i].commitNumber);
            releases[i].releaseMetrics.setSchemaSizeAttribute(1.0*releases[i].releaseMetrics.getSchemaSizeAttribute()/releases[i].commitNumber);
            releases[i].releaseMetrics.computeAttributeUpdates();
            releases[i].commitDuration = Math.ceil((releases[i].newestCommitDate * 1000 - releases[i].oldestCommitDate * 1000) / (1000 * 3600 * 24));
        }
    }

    public getReleasesOnly(projectID:number):Promise<any>{
        return new Promise((resolve) => {
            this.db.all("SELECT * FROM Releases, Projects, Branches WHERE Projects.PRJ_ID = Branches.BR_PRJ_ID"
                + " AND Branches.BR_ID =" + projectID + " AND Releases.RE_BRANCH_ID = Projects.PRJ_ID ORDER BY RE_DATE ASC", function (err, rows) {

                let releases:Array<any> = new Array();
                for(let row of rows){
                    releases.push({name: row.RE_NAME, startDate: row.RE_DATE});
                }
                resolve(releases);
            });
        });
    }

    public getReleases(projectID:number, allReleases:Array<string>):Promise<any>{
        let releases:Array<Release> = new Array;
        let currentPointer = this;
        return new Promise((resolve) => {
            this.db.all("SELECT * FROM Phases,Authors  WHERE BR_ID=" + projectID + " AND CO_AUTHOR_ID=Authors.AU_ID ORDER BY CO_DATE ASC;", function (err, rows) {
                let i =0;
                //let releaseStats:ReleaseStats = new ReleaseStats();
                let contributors= [];

                for(let row of rows){
                    let found = false;
                    let rel:Release = new Release();
                    for(let r of releases){
                        if(row.CO_PREV_RELEASE_ID == null) {
                            if(r.name == "Start_Of_Project") {
                                rel = r;
                                found = true;
                            }
                        }
                        else if(r.name == row.RE_NAME){
                            rel = r;
                            found = true;
                        }
                    }
                    if(i % 12 == 0){

                        //console.log(row.)


                        if(found){
                            currentPointer.assignStatsValue(rel.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                            rel.commitNumber++;

                            let authFound = false;
                            for(let auth of contributors){
                                if(auth == row.AU_NAME){
                                    authFound = true;
                                    break;
                                }
                            }
                            if(!authFound){
                                console.log(row.AU_NAME);
                                contributors.push(row.AU_NAME);
                                rel.contributorNumber++;
                            }
                        }
                        else{
                            contributors = [];
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
                            contributors.push(row.AU_NAME);
                            release.contributorNumber = 1;
                            releases.push(release);



                        }

                        //releaseStats = new ReleaseStats();
                    }
                    else if(i % 12 == 11){
                        rel.newestCommitDate = row.CO_DATE;
                        currentPointer.assignStatsValue(rel.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                    }
                    else{
                        currentPointer.assignStatsValue(rel.releaseMetrics,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                    }
                    i++;
                }
                releases.sort((release1:any, release2:any) => release1.startDate - release2.startDate);

                currentPointer.populateDurations(releases, allReleases);
                console.log(releases.length);
                resolve(releases);
            });
        });
    }



    closeDB(){
        this.db.close();
    }



}
