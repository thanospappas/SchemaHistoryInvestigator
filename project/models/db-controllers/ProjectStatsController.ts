/**
 * Created by thanosp on 18/4/2017.
 */

import {DatabaseController} from "../DatabaseController";

/**
 * If you want to able use these interfaces place export
 * before interface statement
 */
interface ReleaseAuthors{
    releaseName:string;
    authors:Array<Author>;
}

interface Author{
    name:string;
    email:string;
}


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



    groupAuthorsByRelease(rows){
        let releases:Array<ReleaseAuthors> = new Array<ReleaseAuthors>();
        for(let row of rows){
            let ra:ReleaseAuthors = {releaseName: '', authors: []};
            let auth:Author = {name: '', email: ''};
            let found:boolean = false;
            for(let addedRel of releases){
                if(row.RE_NAME == addedRel.releaseName){
                    auth.name = row.AU_NAME;
                    auth.email = row.AU_EMAIL;

                    addedRel.authors.push(auth);
                    found = true;
                }
            }
            if(!found){
                ra.releaseName = row.RE_NAME;
                auth.name = row.AU_NAME;
                auth.email = row.AU_EMAIL;
                ra.authors.push(auth);
                releases.push(ra);
            }
        }
        return releases;
    }

    getReleaseAuthors(projectID):Promise<any>{
        let currentPointer = this;
        return new Promise((resolve) => {
            this.database.DB.all("SELECT DISTINCT RE_ID, RE_NAME, AU_NAME, AU_EMAIL FROM Phases, AUTHORS WHERE BR_PRJ_ID ="
            + projectID + " AND CO_AUTHOR_ID = AU_ID;", function (err, releases) {

                resolve(currentPointer.groupAuthorsByRelease(releases));
            });
        });
    }


}

