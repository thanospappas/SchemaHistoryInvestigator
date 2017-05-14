/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import {ReleaseService} from "../../services/releases.service";
import {CommitService} from "../../services/commits.service";
import {HttpService} from "../../services/http.service";
import {serverPort} from "../../config/server-info";
import {ProjectService} from "../../services/Projects.services";
import {NewlinesFilter} from "../../shared/NewlinesFilter";
import * as $ from 'jquery';


@Component({
    selector: 'commits',
    templateUrl: './commits.html',


})
// Component class implementing OnInit
export class CommitComponent implements OnInit {

    private selectedCommit;
    private commitsRelease;
    private tablesChanged;

    private issues;
    private selectedIssue;
    private buildInfo;

    constructor(private commitService: CommitService, private httpService:HttpService,private projectService:ProjectService,
                private newLineFilter:NewlinesFilter) {

    }

    // Load data ones componet is ready
    ngOnInit() {
        this.commitService.getSelectedCommitChanges().subscribe(
            commit => {
                this.selectedCommit = commit;
                this.selectedCommit.releaseDate = new Date(parseInt(this.selectedCommit.releaseDate)*1000)
                console.log(this.selectedCommit);
                //this.getRelease();
                this.getTablesChanged();
                this.getBuildInfo();
                this.getIssuesInfo();
            });
    }

    private getRelease(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?belongs_to=true";
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(release => {
                    this.commitsRelease =release[0];
                    this.commitsRelease.RE_DATE = new Date(parseInt(this.commitsRelease.RE_DATE)*1000);
                    console.log(this.commitsRelease);
                },
                err => {
                    console.log(err);
                }
            );
    }

    private getTablesChanged(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?tables_affected=true";
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(tables => {
                    this.tablesChanged =tables;
                    console.log(this.tablesChanged);
                },
                err => {
                    console.log(err);
                }
            );
    }

    private getBuildInfo(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?build_info=true";
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(build => {
                    this.buildInfo = build;
                    console.log(this.buildInfo);
                },
                err => {
                    console.log(err);
                }
            );
    }

    private getIssuesInfo(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?issues_info=true";
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(issues => {
                    this.issues = issues;
                    for(let issue of this.issues){
                        issue.IS_BODY = issue.IS_BODY.substring(2).replace(/\\n/g,'<br/>');
                    }
                    this.selectedIssue = this.issues[0];
                    console.log(this.issues);
                },
                err => {
                    console.log(err);
                }
            );
    }


    setSelectedIssue(issue){
        this.selectedIssue = issue;
    }

}
