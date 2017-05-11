import {DatabaseController} from "../DatabaseController";
import {TableChange} from "../schema-history/TableChange";

/**
 * Created by thanosp on 17/4/2017.
 */

export class CommitController extends DatabaseController{

    constructor(){
        super();
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
            attributesInjectedEjected:-1, attributesUpdated:-1, schemaGrowth:-1, totalChanges: -1, schemaGrowthAttribute:-1};

        finalCommit.author = rows[0].AU_NAME;
        finalCommit.commitId = rows[0].CO_ID;
        finalCommit.commitDate = rows[0].CO_HUMAN_DATE;
        finalCommit.transitionOldVersion = rows[0].TR_OLD_VERSION;
        finalCommit.transitionNewVersion = rows[0].TR_NEW_VERSION;
        for(let i = 0;i<rows.length;i++){
            this.assignMetrics(rows[i],rows[i].ME_VALUE,finalCommit);
        }

        finalCommit.attributesInjectedEjected = finalCommit.attributesInsertedAtSurvivingTables
            + finalCommit.attributesDeletedAtSurvivingTables;

        finalCommit.attributesUpdated = finalCommit.keyChanges + finalCommit.typeChanges;
        finalCommit.schemaGrowth = finalCommit.newTables - finalCommit.oldTables;
        finalCommit.schemaGrowthAttribute = finalCommit.newAttributes - finalCommit.oldAttributes;

        finalCommit.totalChanges = finalCommit.attributesUpdated + finalCommit.attributesInjectedEjected
            + finalCommit.attributeDeletionAtDeath + finalCommit.attributeInsertionAtBirth;

        return finalCommit;

    }

    getAllData(projectID):Promise<any> {

        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Commits, Branches WHERE Commits.CO_BRANCH_ID = Branches.BR_ID AND Branches.BR_PRJ_ID = " + projectID
                + " ORDER BY CO_DATE;", function (err, commits) {

                resolve(commits);
            });
        });

    }

    getSingle(projectID,id):Promise<any> {
        console.log(id)
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Commits, Transitions, Metrics, Authors WHERE Commits.CO_ID = " + id +
            " AND Commits.CO_TRANSITION_ID = Transitions.TR_ID AND Transitions.TR_ID = Metrics.ME_TR_ID " +
                "AND Authors.AU_ID = Commits.CO_AUTHOR_ID", (err, commit) => {
                    resolve(this.createCommitInfo(commit));
            });
        });
    }

    public getCommitsFromRelease(projectID, releaseID){

        //TODO Create a view for this
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Projects, Branches, Commits, Releases, Authors  WHERE Projects.PRJ_ID = " + projectID +
                " AND Projects.PRJ_ID = Branches.BR_PRJ_ID AND Commits.CO_BRANCH_ID = Branches.BR_ID " +
                "AND Commits.CO_AUTHOR_ID=Authors.AU_ID AND Commits.CO_PREV_RELEASE_ID = Releases.RE_ID" +
                " AND Releases.RE_ID = " + releaseID + " ORDER BY CO_DATE ASC;", function (err, commits) {

                resolve(commits);
            });
        });
    }

    getCommitRelease(commitId):Promise<any>{
        return new Promise((resolve) => {
            this.database.DB.all("SELECT RE_DATE, RE_NAME FROM Commits, Releases WHERE Commits.CO_ID = " + commitId
            +" AND Commits.CO_PREV_RELEASE_ID = Releases.RE_ID;", function (err, release) {

                resolve(release);
            });
        });
    }

    isTableAdded(element, index, selectedTable,ll){
        console.log(element);
        console.log(index);
        console.log(selectedTable);

        return true;//el.getTable() === rows[i].TA_NAME;
    }

    createTableChangeList(rows){

        let tableChanges: Array<TableChange> = new Array<TableChange>();
        let t:TableChange = new TableChange;
        t.setTable("bioentry");
        tableChanges.push(t);
        for(let i = 0; i < rows.length; i++){
            //Check if the TA_NAME from db's already added to array
            console.log(tableChanges.findIndex((p) => p.getTable() == rows[i].TA_NAME) );
        }
    }

    getTablesChanged(commitId):Promise<any>{

        return new Promise((resolve) => {
            this.database.DB.all("SELECT CH_EVENT_TYPE, CH_ATTRIBUTE_TYPE, CH_IS_KEY, CH_PRIMARY_KEY, CH_FOREIGN_KEY, TA_NAME " +
                " FROM Commits, Transitions, Changes, Tables WHERE Commits.CO_ID = " + commitId + " AND Commits.CO_TRANSITION_ID = " +
                " Transitions.TR_ID AND Transitions.TR_ID = Changes.CH_TR_ID AND Changes.CH_TA_ID = Tables.TA_ID;",  (err, tables) => {
                this.createTableChangeList(tables);
                resolve(tables);
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