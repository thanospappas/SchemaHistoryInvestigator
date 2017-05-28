/**
 * Created by thanosp on 28/5/2017.
 */

import {DatabaseController} from "../DatabaseController";

export class FilesAffectedController extends DatabaseController{

    constructor(databaseController){
        super(databaseController);
    }

    getAllData(projectID):Promise<any> {
        //TODO Create a view for this
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

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }


}