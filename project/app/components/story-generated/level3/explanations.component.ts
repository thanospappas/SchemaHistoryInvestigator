/**
 * Created by thanosp on 21/5/2017.
 */
import { Component, OnInit }  from '@angular/core';
import {ExplanationsService} from "../../../services/story-level3-service";


@Component({
    selector: 'explanations',
    templateUrl: './explanations.html'
})

export class ExplanationsLevel implements OnInit {

    private textSummaries = [];
    private commitReasons;
    private stats;
    private tablesAffected;
    private issues = [];

    constructor(private explanationsService:ExplanationsService) {  }


    ngOnInit() {
        this.waitForCommitSummary();
        this.waitForReasons();
        this.waitForStats();
        this.waitForTablesAffected();
        this.waitForIssues();
    }

    waitForCommitSummary(){
        this.explanationsService.getTextSummary().subscribe(
            summary => {
                let index = this.textSummaries.findIndex((s) => s == summary);
                console.log(index);
                if(index == -1){
                    this.textSummaries.push(summary);
                }
            });
    }

    waitForReasons(){
        this.explanationsService.getReasonOfCommit().subscribe(
            reasons => {
                this.commitReasons = reasons;
            });
    }

    waitForStats(){
        this.explanationsService.getUsefulStats().subscribe(
            stats => {
                this.stats = stats;
            });
    }

    waitForTablesAffected(){
        this.explanationsService.getTablesAffected().subscribe(
            tables => {
                this.tablesAffected = tables;
            });
    }

    waitForIssues(){
        this.explanationsService.getIssuesInfo().subscribe(
            issues => {
                let selectedIssues = issues as Array<any>;
                if (this.issues){
                    for(let i =0; i < selectedIssues.length; i++){
                        let index = this.issues.findIndex((r) => r.IS_ID == selectedIssues[i].IS_ID);
                        if(index == -1){
                            //issue does not exist on the story => add it
                            this.issues.push(selectedIssues[i]);
                        }
                    }
                    console.log(this.issues);
                }
                else{
                    //first time if issues is null then
                    // assign all the issues to the variable
                    this.issues = selectedIssues;
                    console.log(this.issues);
                }

            });
    }

    removeTextSummary(){
        this.textSummaries = [];
    }

    removeCommitReason(){
        this.commitReasons = null;
    }

    removeStats(){
        this.stats = null;
    }

    removeTables(){
        this.tablesAffected = null;
    }

    removeIssues(){
        this.issues = null;
    }

}