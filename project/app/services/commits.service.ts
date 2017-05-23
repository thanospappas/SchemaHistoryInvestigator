/**
 * Created by thanosp on 11/5/2017.
 */

/**
 * Created by thanosp on 15/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable, ReplaySubject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ReleaseFilter} from "../shared/ReleaseFilter";
import {HttpService} from "./http.service";
import {serverPort} from "../config/server-info";
import {ProjectService} from "./Projects.services";

@Injectable()
export class CommitService {

    private selectedCommit;
    selectedCommitChanged$ = new ReplaySubject(1);

    private selectedCommits;
    selectedCommits$ = new ReplaySubject(1);

    constructor (private httpService: HttpService,private releaseFilter:ReleaseFilter,private projectService:ProjectService) {}

    getSelectedCommit(url:string){
        this.httpService.get(url)
            .subscribe(commit => {
                    this.selectedCommit = commit;
                    this.setSelectedCommit(this.selectedCommit);
                },
                err => {
                    console.log(err);
                }
            );

        /*return this.httpservice.get(url)
            .map((res:Response) => {
                console.log(res);
                this.selectedCommit = res.json();
                console.log(this.selectedCommit);
                this.setSelectedCommit(this.selectedCommit);
                return res.json();

            })
            .catch((error:any) => {
                return Observable.throw(error.json().error || 'Server error')
            });*/

    }


    setSelectedCommit(commit){
        this.selectedCommit = commit;
        this.selectedCommitChanged$.next(this.selectedCommit);
    }

    getSelectedCommitChanges(){
        return this.selectedCommitChanged$;
    }

    setSelectedCommits(range,project){
        console.log(range);
         this.retrieveSelectedCommits(range[0].getTime()/1000, range[1].getTime()/1000,project);

    }

    getSelectedCommits(){
        return this.selectedCommits$;
    }

    retrieveSelectedCommits(minDate,maxDate,project){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + project.projectId + "/releases?in_range=" + minDate +"," +maxDate;
        console.log(url);
        this.httpService.get(url)
            .subscribe(commits => {
                    this.selectedCommits =  commits;
                    this.selectedCommits$.next(this.selectedCommits);
                },
                err => {
                    console.log(err);
                }
            );
    }



}
