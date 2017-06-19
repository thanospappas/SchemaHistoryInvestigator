import {DatabaseController} from "../DatabaseController";
import {TableChange} from "../schema-history/TableChange";
import {AtomicSchemaChange} from "../schema-history/AtomicSchemaChange";
import {CommitSummary} from "../project/CommitSummary";
import {ReleaseController} from "./ReleaseController";
import {Commit} from "../project/Commit";
import {CommitClassifier} from "../Classifier/CommitClassifier";

/**
 * Created by thanosp on 17/4/2017.
 */

export class CommitController extends DatabaseController{

    constructor(databaseController){
        super(databaseController);
    }

    assignMetrics(row,value,commit:CommitInformation){
            if (row.ME_TYPE_OF_METRIC==("tDel")) {
                commit.tableDeaths=value;
            } else if (row.ME_TYPE_OF_METRIC==("tIns")) {
                commit.tableBirths = value;
            } else if (row.ME_TYPE_OF_METRIC==("aDel")) {
                commit.attributesDeletedAtSurvivingTables = value;
            } else if (row.ME_TYPE_OF_METRIC==("aIns")) {
                commit.attributesInsertedAtSurvivingTables = value;
            } else if (row.ME_TYPE_OF_METRIC==("aTabDel")) {
                commit.attributeDeletionAtDeath = value;
            } else if (row.ME_TYPE_OF_METRIC==("aTabIns")) {
                commit.attributeInsertionAtBirth = value;
            } else if (row.ME_TYPE_OF_METRIC==("aTypeAlt")) {
                commit.typeChanges = value;
            } else if (row.ME_TYPE_OF_METRIC==("keyAlt")) {
                commit.keyChanges = value;
            } else if (row.ME_TYPE_OF_METRIC==("newT")){
                commit.newTables = value;
            } else if (row.ME_TYPE_OF_METRIC==("newA")){
                commit.newAttributes = value;
            } else if (row.ME_TYPE_OF_METRIC==("oldT")){
                commit.oldTables= value;
            } else if (row.ME_TYPE_OF_METRIC==("oldA")){
                commit.oldAttributes = value;
            }
    }


    createCommitInfo(rows){
        /**
         *
         * Initialize object for return
         */
        let finalCommit:CommitInformation = {commitText:'', commitId:-1,  commitDate:'', author:'',
            transitionOldVersion:'', transitionNewVersion:'',  attributeDeletionAtDeath:-1,
            attributeInsertionAtBirth:-1,tableBirths:-1, tableDeaths:-1,  oldTables:-1,
            newTables:-1, oldAttributes:-1,  newAttributes:-1,  keyChanges:-1, typeChanges:-1,
            attributesDeletedAtSurvivingTables:-1, attributesInsertedAtSurvivingTables:-1,
            attributesInjectedEjected:-1, attributesUpdated:-1, schemaGrowth:-1, totalChanges: 0,
            schemaGrowthAttribute:-1, release:'',releaseDate: -1, filesAffected: -1, commitSummary: ''};

        if(!rows[0]){
            let tmpRows = rows;
            rows = [];
            rows.push(tmpRows);
        }

        finalCommit.author = rows[0].AU_NAME;
        finalCommit.commitId = rows[0].CO_ID;
        finalCommit.commitDate = rows[0].CO_HUMAN_DATE;
        finalCommit.transitionOldVersion = rows[0].TR_OLD_VERSION;
        finalCommit.transitionNewVersion = rows[0].TR_NEW_VERSION;
        finalCommit.commitText = rows[0].CO_TEXT;
        finalCommit.commitSummary = rows[0].CO_TEXT_SUMMARY;

        if (rows[0].RE_NAME) {
            finalCommit.release = rows[0].RE_NAME;
            finalCommit.releaseDate = rows[0].RE_DATE;
        } else {
            finalCommit.release = "Start_Of_Project";
            finalCommit.releaseDate = rows[0].CO_DATE;
        }
        for(let i = 0;i<rows.length;i++){
            this.assignMetrics(rows[i],rows[i].ME_VALUE,finalCommit);
        }

        finalCommit.attributesInjectedEjected = finalCommit.attributesInsertedAtSurvivingTables
            + finalCommit.attributesDeletedAtSurvivingTables;

        finalCommit.attributesUpdated = finalCommit.keyChanges + finalCommit.typeChanges
            + finalCommit.attributesInsertedAtSurvivingTables + finalCommit.attributesDeletedAtSurvivingTables;
        finalCommit.schemaGrowth = finalCommit.newTables - finalCommit.oldTables;
        finalCommit.schemaGrowthAttribute = finalCommit.newAttributes - finalCommit.oldAttributes;

        finalCommit.totalChanges = finalCommit.attributesUpdated + finalCommit.attributesInjectedEjected
            + finalCommit.attributeDeletionAtDeath + finalCommit.attributeInsertionAtBirth;

        return finalCommit;

    }

    getAllData(projectID):Promise<any> {
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Commits, Branches WHERE Commits.CO_BRANCH_ID = Branches.BR_ID AND Branches.BR_PRJ_ID = " + projectID
                + " ORDER BY CO_DATE;", function (err, commits) {

                resolve(commits);
            });
        });
    }

    getSingle(projectID,id):Promise<any> {
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all(
                "SELECT DISTINCT * FROM Commits LEFT OUTER JOIN Releases ON Commits.CO_PREV_RELEASE_ID = Releases.RE_ID, Transitions, Metrics, Authors WHERE" +
                "  (Commits.CO_ID = " + id +" AND Commits.CO_TRANSITION_ID = Transitions.TR_ID " +
                "AND Transitions.TR_ID = Metrics.ME_TR_ID AND Authors.AU_ID = Commits.CO_AUTHOR_ID) ",
                (err, commit) => {
                    resolve(this.createCommitInfo(commit));
            });
        });
    }

    public getCommitsFromRelease(projectID, releaseID){
        //TODO Create a view for this
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Projects, Branches, Commits, Releases, Authors  WHERE Projects.PRJ_ID = " + projectID +
                " AND Projects.PRJ_ID = Branches.BR_PRJ_ID AND Commits.CO_BRANCH_ID = Branches.BR_ID " +
                "AND Commits.CO_AUTHOR_ID=Authors.AU_ID AND Commits.CO_PREV_RELEASE_ID = Releases.RE_ID" +
                " AND Releases.RE_ID = " + releaseID + " ORDER BY CO_DATE ASC;", function (err, commits) {
                resolve(commits);
            });
        });
    }

    getCommitRelease(projectID,commitId):Promise<any>{
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT RE_DATE, RE_NAME CO_ID FROM Commits, Releases WHERE Commits.CO_ID = " + commitId
            +" AND Commits.CO_PREV_RELEASE_ID = Releases.RE_ID;", function (err, release) {
                console.log(release);
                resolve(release);
            });
        });
    }

    private createTableChangeList(rows){

        let tableChanges: Array<TableChange> = new Array<TableChange>();

        for(let i = 0; i < rows.length; i++){

            let acc:AtomicSchemaChange = new AtomicSchemaChange;
            acc.setAttributeName(rows[i].CH_ATTRIBUTE_NAME);
            acc.setAttributeType(rows[i].CH_ATTRIBUTE_TYPE);
            acc.setEventType(rows[i].CH_EVENT_TYPE);
            acc.setForeignKey(rows[i].CH_FOREIGN_KEY);
            acc.setIskey(rows[i].CH_IS_KEY);
            acc.setPrimaryKey(rows[i].CH_PRIMARY_KEY);

            //Check if the TA_NAME from db's already added to array
            let index = tableChanges.findIndex((p) => p.getTable() == rows[i].TA_NAME);
            if(index == -1){
                let tableChange:TableChange = new TableChange();
                tableChange.setTable(rows[i].TA_NAME);
                tableChange.addChange(acc);
                tableChanges.push(tableChange);
            }
            else{
                tableChanges[index].addChange(acc);
            }
        }

        return tableChanges;

    }

    getTablesChanged(projectID, commitId):Promise<any>{

        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT CH_EVENT_TYPE, CH_ATTRIBUTE_TYPE, CH_IS_KEY, CH_PRIMARY_KEY, CH_FOREIGN_KEY, TA_NAME, CH_ATTRIBUTE_NAME " +
                " FROM Commits, Transitions, Changes, Tables WHERE Commits.CO_ID = " + commitId + " AND Commits.CO_TRANSITION_ID = " +
                " Transitions.TR_ID AND Transitions.TR_ID = Changes.CH_TR_ID AND Changes.CH_TA_ID = Tables.TA_ID;",  (err, tables) => {
                resolve(this.createTableChangeList(tables));
            });
        });
    }

    getBuildInfo(projectID, commitId){

        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT BU_ID, BU_REPO_ID, BU_EVENT_TYPE, BU_FINISHED_AT, BU_NUMBER, BU_STATE, BU_RESULT," +
                " BU_DURATION, BU_MESSAGE, BU_STARTED_AT FROM Commits, Builds, Branches WHERE Commits.CO_ID = " +
                commitId + " AND Commits.CO_BRANCH_ID = Branches.BR_ID AND Commits.CO_SHA = Builds.BU_COMMIT_ID",  (err, build) => {

                resolve(build);
            });
        });
    }

    getIssues(projectID, commitId){

        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Issues, Commits WHERE (Commits.CO_ID = " +
                commitId + " AND Commits.CO_ID = Issues.IS_NEXT_CREATED_COMMIT_ID) OR " +
                "(Commits.CO_ID = " + commitId + " AND Commits.CO_ID = Issues.IS_PREV_CREATED_COMMIT_ID) GROUP BY IS_TITLE;",  (err, issues) => {

                resolve(issues);
            });
        });

    }

    getFilesAffected(projectID, commitId):Promise<any>{
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Files_Affected WHERE FA_COMMIT_ID = " + commitId, (err, files) => {
                resolve(files);
            });
        });
    }

    getAllInfo(projectID):Promise<any> {

        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Branches, Commits LEFT OUTER JOIN Releases ON Commits.CO_PREV_RELEASE_ID = Releases.RE_ID, " +
                "Transitions, Metrics, Authors WHERE Commits.CO_BRANCH_ID = Branches.BR_ID" +
                " AND Branches.BR_PRJ_ID = " + projectID  +
                " AND Commits.CO_TRANSITION_ID = Transitions.TR_ID AND Transitions.TR_ID = Metrics.ME_TR_ID " +
                "AND Authors.AU_ID = Commits.CO_AUTHOR_ID ORDER BY CO_DATE ASC", (err, commits) => {
                let finalCommits= [];
                let singleCommitInfo = [];
                for(let i= 0; i <commits.length;i++){

                    if (i % 12 == 0 && i > 0){
                        finalCommits.push(this.createCommitInfo(singleCommitInfo));
                        singleCommitInfo = [];
                        singleCommitInfo.push(commits[i]);
                    }
                    else{
                        singleCommitInfo.push(commits[i]);
                    }
                }
                finalCommits.push(this.createCommitInfo(singleCommitInfo));
                resolve(finalCommits);
            });
        });
    }

    generateSummary(projectId) {

        let finalCommits = [];
        let releasePromises = [];

        return new Promise((resolve) => {
            this.getAllInfo(projectId)
            .then(commits =>{
                let cc:CommitClassifier = new CommitClassifier();
                cc.setCommitsForClassification(commits);
                cc.computeThresholds();
                cc.classifyReleases();
                let classifiedCommits = cc.getClassifiedCommits();
                console.log(classifiedCommits);
                for(let commit of commits){
                    console.log(commit);
                    let releasePromise = this.getFilesAffected(projectId,commit.commitId);
                    releasePromises.push(releasePromise);
                }
                Promise.all(releasePromises)
                    .then(allFiles=>{

                        let commitSummaries:Array<CommitSummary> = new Array<CommitSummary>();

                        for(let files of allFiles){

                            if(files.length == 0)
                                continue;
                            let index = commits.findIndex((p) => {
                                return p.commitId == parseInt(files[0].FA_COMMIT_ID);
                            });

                            commits[index].filesAffected = files.length;
                            let commitSummary = new CommitSummary();
                            commitSummary.setCommitInfo(commits[index]);
                            commitSummary.setLabels(classifiedCommits[index].labels.toString());
                            commitSummary.setPosition(index);
                            commitSummaries.push(commitSummary);
                        }

                        let storePromises = [];
                        for(let c of commitSummaries){
                            c.generateParagraphs();
                        }

                        for(let c of commitSummaries){
                            let storePromise = this.storeSummary(projectId, c.getCommitInformation().commitId, c.getFinalSummary());
                            storePromises.push(storePromise);
                        }

                        Promise.all(storePromises)
                            .then(aa=>{

                                   resolve("Success");

                            });


                    });
            });

        });

    }

    storeSummary(projectID, commitId,text:string):Promise<any>{
        console.log("UPDATE Commits SET CO_TEXT_SUMMARY = '" +
            text + "' WHERE Commits.CO_ID=" + commitId + ";");
        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("UPDATE Commits SET CO_TEXT_SUMMARY = '" +
                text + "' WHERE Commits.CO_ID=" + commitId + ";", (err, commits) => {
                console.log(commits);
                resolve();
            });
        });
    }

    createCommitList(rows){
        let commits:Array<Commit> = new Array<Commit>();
        for(let row of rows){
            let commit = new Commit();
            commit.setDate(row.CO_DATE);
            commit.setText(row.CO_TEXT);
            commit.setAuthor(row.AU_NAME, row.AU_EMAIL);
            commit.setId(row.CO_ID);
            commit.setRelease(row.RE_NAME);
            commits.push(commit);
        }
        return commits;
    }

    getCommitsInRange(projectId, range){
        let rangeList = range.split(",");
        let query = "SELECT * FROM Branches, Commits, Authors WHERE CO_DATE BETWEEN " +
            rangeList[0] + " AND " + rangeList[1] + " AND Authors.AU_ID = CO_AUTHOR_ID AND Branches.BR_PRJ_ID = "+
            projectId + " AND Branches.BR_ID = Commits.CO_BRANCH_ID ORDER BY CO_DATE ASC;";
        return new Promise((resolve) => {
            this.database.getDBConnection(projectId).all(query,  (err, rows) => {
                resolve(this.createCommitList(rows));
            });
        });
    }



}


/**
 * TODO Merge this with the Commit Object!
 */

export interface CommitInformation{
    commitText:string;
    commitId:number;
    commitDate:string;
    author:string;
    release:string;
    releaseDate:number;
    filesAffected:number;
    commitSummary:string;

    transitionOldVersion:string;
    transitionNewVersion:string;
    attributeDeletionAtDeath:number;
    attributeInsertionAtBirth:number;
    tableBirths:number;
    tableDeaths:number;
    oldTables:number;
    newTables:number;
    oldAttributes:number;
    newAttributes:number;
    keyChanges:number;
    typeChanges:number;
    attributesDeletedAtSurvivingTables:number;
    attributesInsertedAtSurvivingTables:number;

    attributesInjectedEjected:number;
    attributesUpdated:number;
    schemaGrowth:number;
    schemaGrowthAttribute:number;

    totalChanges:number;

}