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
import {ExplanationsService} from "../../services/story-level3-service";
import {IssuesFilter} from "../../shared/IssueFilter";

declare var tinymce:any;
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
    private editor;
    private editorContent;
    private summarySaved = false;


    constructor(private commitService: CommitService, private httpService:HttpService,private projectService:ProjectService,
                private newLineFilter:NewlinesFilter, private explanationsService:ExplanationsService, private issuesOrderBy:IssuesFilter) {

    }

    // Load data ones componet is ready
    ngOnInit() {
        this.commitService.getSelectedCommitChanges().subscribe(
            commit => {
                this.selectedCommit = commit;
                this.selectedCommit.releaseDate = new Date(parseInt(this.selectedCommit.releaseDate)*1000);
                this.selectedCommit.commitText = this.selectedCommit.commitText.replace(/\\n/g,'<br/>');

                this.getTablesChanged();
                this.getBuildInfo();
                this.getIssuesInfo();
                //console.log(this.newLineFilter.transform(this.selectedCommit.commitSummary));
                //console.log(tinymce);
                tinymce.activeEditor.setContent(this.newLineFilter.transform(this.selectedCommit.commitSummary));
                //console.log(tinymce.activeEditor.getContent());
            });


    }


    ngAfterViewInit() {


        tinymce.init({
            selector: '#commitSummary__yo',
            plugins: ['paste'],

            skin_url: '../public/assets/skins/lightgray',
            height : "380",

            /*setup: editor => {
                this.editor = editor;
                console.log(editor);
                editor.on('keyup', () => {
                    const content = editor.getContent();
                });
                editor.fire('ScrollWindow', function(){});
            },*/

        });
        console.log(this.editor);
        console.log(tinymce )
    }

    private getRelease(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?belongs_to=true";
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(release => {
                    this.commitsRelease =release[0];
                    this.commitsRelease.RE_DATE = new Date(parseInt(this.commitsRelease.RE_DATE)*1000);

                },
                err => {
                    console.log(err);
                }
            );
    }

    private getTablesChanged(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?tables_affected=true";
        this.httpService.get(url)
            .subscribe(tables => {
                    this.tablesChanged =tables;
                },
                err => {
                    console.log(err);
                }
            );
    }

    private getBuildInfo(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?build_info=true";
        this.httpService.get(url)
            .subscribe(build => {
                    this.buildInfo = build;
                },
                err => {
                    console.log(err);
                }
            );
    }

    private getIssuesInfo(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId +"?issues_info=true";
        this.httpService.get(url)
            .subscribe(issues => {
                    this.issues = issues;
                    for(let issue of this.issues){
                        if(issue.IS_BODY)
                            issue.IS_BODY = issue.IS_BODY.substring(2).replace(/\\n/g,'<br/>');
                    }
                    this.selectedIssue = this.issues[0];
                },
                err => {
                    console.log(err);
                }
            );
    }


    setSelectedIssue(issue){
        this.selectedIssue = issue;
    }

    increaseUsefulness(){
        const url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.projectService.getSelectedProjectData().projectId + "/issues/" + this.selectedIssue.IS_ID;
        console.log(url);
        this.httpService.updateIssueScore(url);
    }

    updateCommitSummary(){
        console.log(tinymce.activeEditor.getContent());
        const url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId;
        this.httpService.update(url,{commitSummary: tinymce.activeEditor.getContent()});
        this.summarySaved = true;
    }

    getNewInfo(){
        this.summarySaved = false;
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + this.selectedCommit.commitId;
        console.log("url: " + url);
        this.httpService.get(url)
            .subscribe(commit => {
                    this.selectedCommit = commit;
                    this.selectedCommit.releaseDate = new Date(parseInt(this.selectedCommit.releaseDate)*1000);
                    this.selectedCommit.commitText = this.selectedCommit.commitText.replace(/\\n/g,'<br/>');
                },
                err => {
                    console.log(err);
                }
            );
    }


    addSummaryToStory(){
        let commitSummaryInfo = {release: -1, commitSummary: '', humanDate:''};
        commitSummaryInfo.commitSummary = this.selectedCommit.commitSummary;
        commitSummaryInfo.release = this.selectedCommit.release;
        commitSummaryInfo.humanDate = this.selectedCommit.commitDate;
        this.explanationsService.addTextSummary(commitSummaryInfo);
    }

    addCommitReasonsToStory(){
        let commitSummaryInfo = {release: -1, commitReason: '', humanDate:''};
        commitSummaryInfo.commitReason = this.selectedCommit.commitText;
        commitSummaryInfo.release = this.selectedCommit.release;
        commitSummaryInfo.humanDate = this.selectedCommit.commitDate;
        this.explanationsService.addReasonOfCommit(commitSummaryInfo)
    }

    addIssuesToStory(){
        this.explanationsService.addIssuesInfo(this.issues);
    }

    addSelectedIssueToStory(){
        let issue = [];
        issue.push(this.selectedIssue);
        this.explanationsService.addIssuesInfo(issue);
    }

    addStatsToStory(){
        this.explanationsService.addUsefulStats(this.selectedCommit);
    }

    addTablesAffectedToStory(){
        let commitSummaryInfo = {release: -1, tablesChanged: '', humanDate:'', commitId:-1};
        commitSummaryInfo.tablesChanged = this.tablesChanged;
        commitSummaryInfo.release = this.selectedCommit.release;
        commitSummaryInfo.commitId = this.selectedCommit.commitId;
        commitSummaryInfo.humanDate = this.selectedCommit.commitDate;
        this.explanationsService.addTablesAffected(commitSummaryInfo);
    }


}
