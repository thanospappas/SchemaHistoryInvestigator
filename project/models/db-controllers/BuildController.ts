/**
 * Created by thanosp on 17/4/2017.
 */
import {DatabaseController} from "../DatabaseController";

export class BuildController extends DatabaseController{

    constructor(){
        super();
    }

    getAllData(projectID):Promise<any> {

        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Branches,Builds WHERE BR_PRJ_ID=" + projectID + " AND BR_NAME='master' AND BU_BRANCH_ID=BR_ID;", function (err, commits) {
                resolve(commits);
            });
        });

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }


}