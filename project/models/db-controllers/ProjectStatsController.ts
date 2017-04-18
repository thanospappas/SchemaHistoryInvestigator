/**
 * Created by thanosp on 18/4/2017.
 */

import {DatabaseController} from "../DatabaseController";

export class AuthorsController extends DatabaseController{

    constructor(){
        super();
    }

    getAllData(projectID):Promise<any> {
        //TODO create view for this
        return new Promise((resolve) => {
            this.database.DB.all("SELECT AU_NAME, AU_EMAIL, COUNT(Authors.AU_EMAIL) AS CommitNumber FROM Projects, Branches, Commits, Authors " +
                "WHERE Projects.PRJ_ID = " + projectID + " AND Branches.BR_PRJ_ID = Projects.PRJ_ID AND Commits.CO_BRANCH_ID = Branches.BR_ID " +
                "AND Authors.AU_ID = Commits.CO_AUTHOR_ID GROUP BY Authors.AU_NAME ORDER BY CommitNumber DESC;", function (err, commits) {
                resolve(commits);
            });
        });

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }


}