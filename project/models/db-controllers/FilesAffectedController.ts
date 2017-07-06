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
            this.database.getDBConnection(projectID).all("SELECT FA_NEW_FULL_PATH, COUNT(Files_Affected.FA_NEW_FULL_PATH) AS Ranked FROM  Commits, Files_Affected WHERE" +
                " Commits.CO_ID = Files_Affected.FA_COMMIT_ID GROUP BY Files_Affected.FA_NEW_FULL_PATH ORDER BY Ranked DESC;", function (err, rows) {
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