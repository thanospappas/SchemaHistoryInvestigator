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


@Component({
    selector: 'commits',
    templateUrl: './commits.html',


})
// Component class implementing OnInit
export class CommitComponent implements OnInit {

    private selectedCommit;
    private commitsRelease;

    constructor(private commitService: CommitService, private httpService:HttpService,private projectService:ProjectService) {

    }

    // Load data ones componet is ready
    ngOnInit() {
        this.commitService.getSelectedCommitChanges().subscribe(
            commit => {
                this.selectedCommit = commit;
                console.log(this.selectedCommit);
                this.getRelease();
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

}
