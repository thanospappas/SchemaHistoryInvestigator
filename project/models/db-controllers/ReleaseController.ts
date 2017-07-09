/**
 * Created by thanosp on 17/4/2017.
 */

import * as Promise from "bluebird";
import {Release} from "../project/Release";
import {Stats} from "../schema-history/ReleaseStats";
import {DatabaseController} from "../DatabaseController";
import {Commit} from "../project/Commit";
import {ReleaseSummary} from "../project/ReleaseSummary";
import {ReleaseClassifier} from "../Classifier/ReleaseClassifier";

export class ReleaseController extends DatabaseController{

   constructor(databaseController){
        super(databaseController);
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
            stats.setTablesAtEnd(value);
            if(stats.getTablesAtStart() == -1){
                stats.setTablesAtStart(value);
            }
        } else if (type==("newA")){
            stats.setSchemaSizeAttribute(value + stats.getSchemaSizeAttribute());
            stats.setAttributesAtEnd(value);
            if(stats.getAttributesAtStart() == -1){
                stats.setAttributesAtStart(value);
            }
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
                if(releases[i].duration == null){
                    releases[i].duration = (new Date("February 3, 2017").getTime() - releases[i].startDate * 1000) / (1000 * 3600 * 24);
                }
                //console.log(releases[i]);
            }
            releases[i].stats.setSchemaSizeTable(1.0*releases[i].stats.getSchemaSizeTable()/releases[i].commitNumber);
            releases[i].stats.setSchemaSizeAttribute(1.0*releases[i].stats.getSchemaSizeAttribute()/releases[i].commitNumber);

            if (i > 0){
                releases[i].stats.setTablesAtStart(releases[i-1].stats.getTablesAtEnd());
                releases[i].stats.setAttributesAtStart(releases[i-1].stats.getAttributesAtEnd());
                releases[i].schemaGrowth = releases[i].stats.getTablesAtEnd() - releases[i-1].stats.getTablesAtEnd();
            }
            else{
                releases[i].schemaGrowth = 0;
            }

            releases[i].stats.computeAttributeUpdates();
            releases[i].commitDuration = Math.ceil((releases[i].newestCommitDate * 1000 - releases[i].oldestCommitDate * 1000) / (1000 * 3600 * 24));
        }
    }

    private getReleasesOnly(projectID:number):Promise<any>{
        //console.log("SELECT * FROM Releases WHERE " + " Releases.RE_BRANCH_ID =" + projectID + " ORDER BY RE_DATE ASC");
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all(/*"SELECT * FROM Releases, Projects, Branches WHERE Projects.PRJ_ID = Branches.BR_PRJ_ID"
                + " AND Branches.BR_ID =" + projectID + " AND Releases.RE_BRANCH_ID = Projects.PRJ_ID ORDER BY RE_DATE ASC"*/
            "SELECT * FROM Releases WHERE " + " Releases.RE_BRANCH_ID =" + projectID + " ORDER BY RE_DATE ASC", function (err, rows) {
                let releases:Array<any> = new Array();
                for(let row of rows){
                    releases.push({name: row.RE_NAME, startDate: row.RE_DATE});
                }
                //console.log(releases);
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
                        release.dateHuman = new Date(parseInt(row.CO_DATE)*1000);
                    }
                    else{
                        release.name = row.RE_NAME;
                        release.startDate = row.RE_DATE;
                        release.dateHuman = new Date(parseInt(row.RE_DATE)*1000);
                    }
                    release.oldestCommitDate = row.CO_DATE;

                    release.releaseSummary = row.RE_TEXT_SUMMARY;

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
            this.database.getDBConnection(projectID).all("SELECT * FROM Phases,Authors  WHERE BR_PRJ_ID=" + projectID + " AND CO_AUTHOR_ID=Authors.AU_ID ORDER BY CO_DATE ASC;", (err, rows) => {
                releases = this.populateReleases(rows);
                releases.sort((release1:any, release2:any) => release1.startDate - release2.startDate);
                this.populateDurations(releases, allReleases);
                //console.log(releases);
                resolve(releases);
            });
        });

    }

    getAllData(projectID):Promise<any>{
       //let selectedBranchId;
        return new Promise((resolve) => {
            this.getReleasesOnly(projectID)
            .then((releases) =>{
                return this.getReleases(projectID,releases);
            })
            .then((result) => {
                resolve (result);
            });
    });
    }

    getReleaseMetrics(projectID):Promise<any>{

            let releases: Array<Release> = new Array;
            return new Promise((resolve) => {
                this.database.getDBConnection(projectID).all("SELECT * FROM Releases_Metrics ORDER BY RM_START_DATE ASC;", (err, rows) => {
                    //console.log(rows);
                    for(let i = 0; i < rows.length; i++){
                        let release:Release = new Release();
                        release.releaseID = rows[i].RM_RE_ID;
                        release.name = rows[i].RM_NAME;
                        release.startDate = rows[i].RM_START_DATE;
                        release.dateHuman = rows[i].RM_DATE_HUMAN;
                        release.duration = rows[i].RM_DURATION;
                        release.commitNumber = rows[i].RM_COMMIT_NUMBER;
                        release.commitDuration = rows[i].RM_COMMIT_DURATION;
                        release.contributorNumber = rows[i].RM_CONTRIBUTOR_NUMBER;
                        release.schemaGrowth = rows[i].RM_SCHEMA_GROWTH;
                        release.releaseSummary = rows[i].RM_RELEASE_SUMMARY;

                        release.stats.setTablesAtStart(rows[i].RM_TABLES_AT_START);
                        release.stats.setTablesAtEnd(rows[i].RM_TABLES_AT_END);
                        release.stats.setTableInsertions(parseInt(rows[i].RM_TABLE_BIRTHS));
                        release.stats.setTableDeletions(parseInt(rows[i].RM_TABLE_DEATHS));
                        release.stats.setAttributeInsertionsAtExistingTables(parseInt(rows[i].RM_ATTRS_INJECTED));
                        release.stats.setAttributeDeletionsAtExistingTables(parseInt(rows[i].RM_ATTRS_EJECTED));
                        release.stats.setAttributesInsertedAtNewTables(parseInt(rows[i].RM_TABLE_BORN_ATTRS));
                        release.stats.setAttributesDeletedAtDeletedTables(parseInt(rows[i].RM_TABLE_GONE_ATTRS));
                        release.stats.setAttributeTypeAlternations(parseInt(rows[i].RM_TYPE_UPD));
                        release.stats.setKeyAlternations(parseInt(rows[i].RM_KEY_ALT));
                        release.stats.setSchemaSizeTable(parseInt(rows[i].RM_SCHEMA_SIZE_TABLES));
                        release.stats.setSchemaSizeAttribute(parseInt(rows[i].RM_SCHEMA_SIZE_ATTRS));
                        release.stats.computeAttributeUpdates();
                        releases.push(release);
                    }

                    resolve(releases);
                });
            });
    }

    getSingle(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    generateReleaseMetrics(projectId){
        return new Promise((resolve) => {

            this.getAllData(projectId).then(releases => {
                let storePromises = [];

                for(let r of releases){
                    //console.log(r);
                    let storePromise = this.storeReleaseMetrics(projectId,r);
                    storePromises.push(storePromise);
                }
                Promise.all(storePromises)
                    .then(aa=>{

                        resolve("Success");

                    });
            });

        });
    }

    storeReleaseMetrics(projectID, release):Promise<any>{
        let dateHuman = release.dateHuman.toDateString();
        //console.log(dateHuman);
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("INSERT INTO Releases_Metrics(RM_RE_ID,RM_NAME,RM_START_DATE,RM_DATE_HUMAN," +
                "RM_DURATION,RM_COMMIT_NUMBER,RM_COMMIT_DURATION,RM_CONTRIBUTOR_NUMBER,RM_SCHEMA_GROWTH,RM_RELEASE_SUMMARY," +
                "RM_TABLE_BIRTHS,RM_TABLE_DEATHS,RM_ATTRS_INJECTED,RM_ATTRS_EJECTED,RM_TABLE_BORN_ATTRS,RM_TABLE_GONE_ATTRS," +
                "RM_KEY_ALT,RM_TYPE_UPD,RM_SCHEMA_SIZE_TABLES,RM_SCHEMA_SIZE_ATTRS,RM_TABLES_AT_START,RM_TABLES_AT_END) VALUES(" +
                release.releaseID + ",'" + release.name + "'," + release.startDate + ",'" + release.dateHuman.toLocaleString()  + "'," + release.duration +
                "," + release.commitNumber + "," + release.commitDuration + "," + release.contributorNumber + "," +
                release.schemaGrowth + ",'" + release.releaseSummary + "'," + release.stats.getTableInsertions() +
                "," + release.stats.getTableDeletions() + "," + release.stats.getAttributeInsertionsAtExistingTables() +
                "," + release.stats.getAttributeDeletionsAtExistingTables() + "," + release.stats.getAttributesInsertedAtNewTables() +
                "," + release.stats.getAttributesDeletedAtDeletedTables() + "," + release.stats.getKeyAlternations() +
                "," + release.stats.getAttributeTypeAlternations() + "," + release.stats.getSchemaSizeTable() + "," +
                release.stats.getSchemaSizeAttribute() + "," + release.stats.getTablesAtStart() + "," + release.stats.getTablesAtEnd() + ");",
                (err, commits) => {
                //console.log(commits);
                //console.log(err);
                resolve();
            });
        });
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
                index = rNames.indexOf("Start_Of_Project");
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
                let tableInfo = {changes:[], tableName: ''};
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
            this.database.getDBConnection(projectID).all("SELECT DISTINCT TA_NAME, RE_NAME, RE_DATE, TR_TRANSITION_ID, CM_DELETIONS, CM_INSERTIONS, CM_TYPE_ALT, CM_KEY FROM Phases, Changes_Metrics, Tables WHERE" +
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
                if (i > 0){ commit.getStats().computeAttributeUpdates(); }
                commit = new Commit();
                commit.setDate(row.CO_DATE);
                commit.setText(row.CO_TEXT);
                commit.setAuthor(row.AU_NAME, row.AU_EMAIL);
                commit.setId(row.CO_ID);
                commit.setRelease(row.RE_NAME);

                this.assignStatsValue(commit.getStats(),row.ME_TYPE_OF_METRIC,row.ME_VALUE);
                commits.push(commit);
            }
            else{
                this.assignStatsValue(commit.getStats(),row.ME_TYPE_OF_METRIC,row.ME_VALUE);
            }
            i++;
        }
        commits[commits.length-1].getStats().computeAttributeUpdates()
        return commits;
    }

    getReleaseByDateRange(projectID, range){
        let rangeList = range.split(",");
        let query = "SELECT * FROM Phases, Authors WHERE RE_DATE BETWEEN " +
            rangeList[0] + " AND " + rangeList[1] + " AND Authors.AU_ID = CO_AUTHOR_ID AND BR_PRJ_ID = "+
            projectID + " ORDER BY CO_DATE ASC;";
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all(query,  (err, rows) => {
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
            this.database.getDBConnection(projectID).all(query,  (err, rows) => {
                resolve(this.populateReleasesWithCommits(rows));
            });
        });

    }

    generateSummary(projectId){

        return new Promise((resolve) => {
            let rc:ReleaseClassifier = new ReleaseClassifier();
            this.getAllData(projectId).then(releases => {
                //console.log(releases);
                let releaseSummaries:Array<ReleaseSummary> = new Array<ReleaseSummary>();

                rc.setReleasesForClassification(releases);
                rc.computeThresholds();
                rc.classifyReleases();
                let classifiedReleases = rc.getReleases();

                for(let i = 0; i < releases.length; i++){
                    let releaseSummary = new ReleaseSummary();
                    releaseSummary.setReleaseInfo(releases[i]);
                    releaseSummary.setLabels(classifiedReleases[i].labels);
                    releaseSummary.setPosition(i);
                    releaseSummary.generateParagraphs();
                    //console.log()
                    releases[i].releaseSummary = releaseSummary.getFinalSummary();
                    releaseSummaries.push(releaseSummary);
                    //console.log(releaseSummary.getFinalSummary());
                }

                let storePromises = [];

                for(let r of releases){
                    //let storePromise = this.storeSummary(projectId,r.getReleaseInformation().releaseID, r.getFinalSummary());
                    let storePromise = this.storeReleaseMetrics(projectId,r);

                    storePromises.push(storePromise);
                }

                Promise.all(storePromises)
                    .then(aa=>{

                        resolve("Success");

                    });
            });

        });
    }

    storeSummary(projectID, releaseId,text:string):Promise<any>{
        /*console.log("UPDATE Releases SET RE_TEXT_SUMMARY = '" +
            text + "' WHERE Releases.RE_ID=" + releaseId + ";");*/
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("UPDATE Releases SET RE_TEXT_SUMMARY = '" +
                text + "' WHERE Releases.RE_ID=" + releaseId + ";", (err, commits) => {
                //console.log(commits);
                resolve();
            });
        });
    }

}
