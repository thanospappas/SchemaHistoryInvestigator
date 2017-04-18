import {DatabaseController} from "../DatabaseController";

/**
 * Created by thanosp on 17/4/2017.
 */

export class CommitController extends DatabaseController{

    constructor(){
        super();
    }

    getAllData(projectID):Promise<any> {

        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Commits, Projects, Branches WHERE Commits.CO_BRANCH_ID = Branches.BR_ID AND Branches.BR_PRJ_ID = Projects.PRJ_ID" +
                " AND Projects.PRJ_ID = '" + projectID + "' AND Branches.BR_NAME = 'master' ORDER BY CO_DATE;", function (err, commits) {

                resolve(commits);
            });
        });

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }

    public getCommitsFromRelease(projectID, releaseID){

        //TODO Create a view for this
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Projects, Branches, Commits, Releases, Authors  WHERE Projects.PRJ_ID = " + projectID +
                " AND Projects.PRJ_ID = Branches.BR_PRJ_ID AND Commits.CO_BRANCH_ID = Branches.BR_ID " +
                "AND Commits.CO_AUTHOR_ID=Authors.AU_ID AND Commits.CO_PREV_RELEASE_ID = Releases.RE_ID" +
                " AND Releases.RE_ID = " + releaseID + " ORDER BY CO_DATE ASC;", function (err, commits) {
                console.log(commits);
                resolve(commits);
            });
        });
    }


}