import {DatabaseController} from "../DatabaseController";
/**
 * Created by thanosp on 18/4/2017.
 */

export class IssueController extends DatabaseController{

    constructor(databaseController){
        super(databaseController);
    }

    getAllData(projectID):Promise<any> {

        return new Promise((resolve) => {
            this.database.getDBConnection(projectID).all("SELECT * FROM Projects, Issues WHERE Projects.PRJ_ID = Issues.IS_PROJECT_ID AND Projects.PRJ_ID = '" + projectID + "'", function (err, commits) {
                resolve(commits);
            });
        });

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }

    increaseUsefulnessScore(issueId):Promise<any>{
        return new Promise((resolve) => {
            this.database.getDBConnection(issueId).all("UPDATE Issues SET USEFUL_SCORE = USEFUL_SCORE + 1 WHERE" +
                " IS_ID=" + issueId + ";", (err, issues) => {
                //console.log(issues);
                resolve();
            });
        });
    }

}