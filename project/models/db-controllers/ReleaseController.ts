/**
 * Created by thanosp on 17/4/2017.
 */

import * as Promise from "bluebird";
import {Release} from "../project/Release";
import {Stats} from "../schema-history/ReleaseStats";
import {DatabaseController} from "../DatabaseController";
import {Commit} from "../project/Commit";

export class ReleaseController extends DatabaseController{

   constructor(){
        super();
    }

    public getBranchId(projectID:number):Promise<any>{
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Branches WHERE BR_PRJ_ID = " + projectID +" AND BR_NAME='master'", function (err, rows) {
                resolve(rows);
            });
        });
    }

    private assignStatsValue(stats:Stats, type:string, value:number) {
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
        } else if (type==("newT")){
            stats.setSchemaSizeTable(value + stats.getSchemaSizeTable());
        } else if (type==("newA")){
            stats.setSchemaSizeAttribute(value + stats.getSchemaSizeAttribute());
        }
    }

    private populateDurations(releases:Array<Release>, allReleases:Array<any>){
        for(let i = 0; i < releases.length; i++){
            for(let j = 0; j < allReleases.length; j++) {

                if(releases[i].name == "Start_Of_Project"){
                    let duration = Math.ceil((allReleases[0].startDate * 1000 - releases[i].startDate * 1000) / (1000 * 3600 * 24));
                    releases[i].duration = duration;
                    break;
                }
                else if (j < allReleases.length - 1 && allReleases[j].name == releases[i].name) {

                    let duration = Math.ceil((allReleases[j + 1].startDate * 1000 - releases[i].startDate * 1000) / (1000 * 3600 * 24));
                    releases[i].duration = duration;
                    break;
                }
            }
            releases[i].stats.setSchemaSizeTable(1.0*releases[i].stats.getSchemaSizeTable()/releases[i].commitNumber);
            releases[i].stats.setSchemaSizeAttribute(1.0*releases[i].stats.getSchemaSizeAttribute()/releases[i].commitNumber);
            releases[i].stats.computeAttributeUpdates();
            releases[i].commitDuration = Math.ceil((releases[i].newestCommitDate * 1000 - releases[i].oldestCommitDate * 1000) / (1000 * 3600 * 24));
        }
    }

    private getReleasesOnly(projectID:number):Promise<any>{
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Releases, Projects, Branches WHERE Projects.PRJ_ID = Branches.BR_PRJ_ID"
                + " AND Branches.BR_ID =" + projectID + " AND Releases.RE_BRANCH_ID = Projects.PRJ_ID ORDER BY RE_DATE ASC", function (err, rows) {

                let releases:Array<any> = new Array();
                for(let row of rows){
                    releases.push({name: row.RE_NAME, startDate: row.RE_DATE});
                }
                resolve(releases);
            });
        });
    }

    private populateReleases(rows){
        let releases:Array<Release> = new Array;
        let i =0;
        //let releaseStats:Stats = new Stats();
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

                if(found){
                    this.assignStatsValue(rel.stats,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                    rel.commitNumber++;

                    let authFound = false;
                    for(let auth of contributors){
                        if(auth == row.AU_NAME){
                            authFound = true;
                            break;
                        }
                    }
                    if(!authFound){
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
                    release.dateHuman = new Date(parseInt(row.RE_DATE)*1000);
                    console.log(row.CO_PREV_RELEASE_ID);
                    if(row.CO_PREV_RELEASE_ID == null){
                        release.releaseID = -1;
                    }
                    else{
                        release.releaseID = row.CO_PREV_RELEASE_ID;
                    }

                    //release.releaseID = row.RE_ID;
                    this.assignStatsValue(release.stats,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                    release.commitNumber = 1;
                    contributors.push(row.AU_NAME);
                    release.contributorNumber = 1;
                    releases.push(release);



                }

                //releaseStats = new Stats();
            }
            else if(i % 12 == 11){
                rel.newestCommitDate = row.CO_DATE;
                this.assignStatsValue(rel.stats,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
            }
            else{
                this.assignStatsValue(rel.stats,row.ME_TYPE_OF_METRIC,row.ME_VALUE);
            }
            i++;
        }
        return releases;
    }

    private getReleases(projectID:number, allReleases:Array<string>):Promise<any>{
        let releases:Array<Release> = new Array;
        //let currentPointer = this;
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Phases,Authors  WHERE BR_ID=" + projectID + " AND CO_AUTHOR_ID=Authors.AU_ID ORDER BY CO_DATE ASC;", (err, rows) => {

                releases = this.populateReleases(rows);
                releases.sort((release1:any, release2:any) => release1.startDate - release2.startDate);

                this.populateDurations(releases, allReleases);
                resolve(releases);
            });
        });

    }

    getAllData(projectID):Promise<any>{
       let selectedBranchId;
        return new Promise((resolve) => {
       this.getBranchId(projectID)
            .then((res) =>{
                selectedBranchId = res[0].BR_ID;
                return this.getReleasesOnly(res[0].BR_ID);
            })
            .then((releases) => {
                return this.getReleases(selectedBranchId,releases);
            })
            .then((result) => {
                resolve (result);
            });
        });
    }

    getSingle(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     * @param releases
     * @returns {Array}
     *
     */

    createdata(releases){

        let rNames = [];
        for(let r of releases){
            if(r.CO_PREV_RELEASE_ID == null && rNames.indexOf("Start_Of_Project") == -1){
                rNames.push("Start_Of_Project");
                continue;
            }
            if(rNames.indexOf(r.RE_NAME) == -1){
                rNames.push(r.RE_NAME);
            }
        }

        let finalData = [];
        for(let r of releases){

            let index;
            if(rNames.indexOf(r.RE_NAME) == -1)
                index = rNames.indexOf("Start_Of_Project")
            else
                index = rNames.indexOf(r.RE_NAME);

            let found = false;
            for(let table of finalData){

                if(table.tableName == r.TA_NAME){
                    found = true;

                    let ridFound = false;
                    for(let relCh of table.changes){

                        if(relCh[0] == index){
                            ridFound = true;
                            relCh[1] += (parseInt(r.CM_DELETIONS) + parseInt(r.CM_INSERTIONS) + parseInt(r.CM_TYPE_ALT) + parseInt(r.CM_KEY))
                        }
                    }
                    if(!ridFound){
                        let ii =[];
                        ii.push(index);
                        ii.push(parseInt(r.CM_DELETIONS) + parseInt(r.CM_INSERTIONS) + parseInt(r.CM_TYPE_ALT) + parseInt(r.CM_KEY))
                        table.changes.push(ii);
                    }
                }
            }

            if(!found){
                let tableInfo = {changes:[], tableName: ''}
                let tmpArr = [];
                tmpArr.push(index);
                let ch = parseInt(r.CM_DELETIONS) + parseInt(r.CM_INSERTIONS) + parseInt(r.CM_TYPE_ALT) + parseInt(r.CM_KEY)
                tmpArr.push(ch);
                tableInfo.changes.push(tmpArr);
                tableInfo.tableName = r.TA_NAME;
                finalData.push(tableInfo);
            }
        }

        return finalData;

    }

    getReleaseTables(projectID){
        return new Promise((resolve) => {
            this.database.DB.all("SELECT DISTINCT TA_NAME, RE_NAME, RE_DATE, TR_TRANSITION_ID, CM_DELETIONS, CM_INSERTIONS, CM_TYPE_ALT, CM_KEY FROM Phases, Changes_Metrics, Tables WHERE" +
                " BR_PRJ_ID =" + projectID + " AND BR_NAME = 'master' AND TR_ID = CM_TR_ID AND CM_TA_ID = Tables.TA_ID AND CM_DELETIONS <> '-' ORDER BY RE_DATE",  (err, rows) => {

                resolve(this.createdata(rows));
            });
        });

    }

    populateReleasesWithCommits(rows){
        let i =0;
        let commits:Array<Commit> = new Array<Commit>();
        let contributors= [];
        let rel:Release = new Release();
        let commit:Commit = new Commit();
        for(let row of rows){

            if(i % 12 == 0){
                /*
                let release:Release = new Release();
                if(row.CO_PREV_RELEASE_ID == null){
                    release.name = "Start_Of_Project";
                    release.startDate = row.CO_DATE;
                }
                else{
                    release.name = row.RE_NAME;
                    release.startDate = row.RE_DATE;
                }*/
                if (i > 0){ commit.getStats().computeAttributeUpdates(); }
                commit = new Commit();
                commit.setDate(row.CO_DATE);
                commit.setText(row.CO_TEXT);
                commit.setAuthor(row.AU_NAME, row.AU_EMAIL);
                commit.setId(row.CO_ID);

                this.assignStatsValue(commit.getStats(),row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                commits.push(commit);
            }
            else{
                this.assignStatsValue(commit.getStats(),row.ME_TYPE_OF_METRIC,row.ME_VALUE);
            }
            i++;
        }
        return commits;
    }

    getReleaseByDateRange(projectID, range){
        let rangeList = range.split(",");
        let query = "SELECT * FROM Phases, Authors WHERE RE_DATE BETWEEN " +
            rangeList[0] + " AND " + rangeList[1] + " AND Authors.AU_ID = CO_AUTHOR_ID AND BR_PRJ_ID = "+
            projectID + " ORDER BY CO_DATE ASC;";
        return new Promise((resolve) => {
            this.database.DB.all(query,  (err, rows) => {

                resolve(this.populateReleasesWithCommits(rows));
            });
        });
    }

    getReleaseById(releaseID, projectID){

        let releaseIds = releaseID.split(",");
        let query = "";
        if(-1 == parseInt(releaseID)){
            query = "SELECT * FROM Phases, Authors WHERE CO_PREV_RELEASE_ID IS NULL AND BR_PRJ_ID= " +
                projectID + " AND Authors.AU_ID = CO_AUTHOR_ID ORDER BY CO_DATE ASC;"
        }
        else if(releaseIds.length > 1){
            query ="SELECT * FROM Phases, Authors WHERE ";
            for(let i= 0; i< releaseIds.length;i++){
                query += "CO_PREV_RELEASE_ID = " + releaseIds[i];
                if(i < releaseIds.length -1 )
                    query += " OR ";
            }
            query += " AND Authors.AU_ID = CO_AUTHOR_ID ORDER BY CO_DATE ASC;"
        }
        else{
            query ="SELECT * FROM Phases, Authors WHERE CO_PREV_RELEASE_ID = " + releaseID
                + " AND Authors.AU_ID = CO_AUTHOR_ID ORDER BY CO_DATE ASC;"
        }

        return new Promise((resolve) => {
            this.database.DB.all(query,  (err, rows) => {

                resolve(this.populateReleasesWithCommits(rows));
            });
        });

    }






}
