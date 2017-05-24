/**
 * Created by thanosp on 21/5/2017.
 */

import { Component, OnInit }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {HighlightsCharacterizationsService} from "../../../services/story-level2-service";


@Component({
    selector: 'highlights-characterizations',
    templateUrl: './highlights-characterizations.html'
})

export class HighlightsLevel implements OnInit {

    private commitChart;
    private commits;
    private releaseDescriptions;
    private textSummary;

    constructor(private highlightsService:HighlightsCharacterizationsService) {  }


    ngOnInit() {
        this.waitForCommitChart();
        this.waitForTextSummary();
        this.waitForCommitList();
        this.waitForReleaseDescriptions();
    }

    private waitForCommitChart(){
        this.highlightsService.getCommitChart().subscribe(
            chart => {
                this.commitChart = chart;
                let newSvg = document.getElementById('commit-chart-story');
                newSvg.innerHTML = this.commitChart;
            });
    }

    private waitForTextSummary(){
        this.highlightsService.getTextSummary().subscribe(
            textSummary => {
                this.textSummary = textSummary;
            });
    }

    private waitForCommitList(){
        this.highlightsService.getSelectedCommits().subscribe(
            commits => {
                this.commits = commits;

            });
    }

    private waitForReleaseDescriptions(){
        this.highlightsService.getReleaseDescriptions().subscribe(
            releaseDescriptions => {
                //Convert data to array so that I can traverse it
                let selectedReleases = releaseDescriptions as Array<any>;
                if (this.releaseDescriptions){
                    for(let i =0; i < selectedReleases.length; i++){
                        let index = this.releaseDescriptions.findIndex((r) => r.releaseID == selectedReleases[i].releaseID);
                        if(index == -1){
                            //release does not exist on the story => add it
                            this.releaseDescriptions.push(selectedReleases[i]);
                        }
                    }
                }
                else{
                    //first time if releaseDesciptions is null then
                    // assign all the releases to the variable
                    this.releaseDescriptions = releaseDescriptions;
                }
            });
    }

    private removeCommitChart(){
        this.commitChart = null;
        let newSvg = document.getElementById('commit-chart-story');
        newSvg.innerHTML = '';
    }

    private removeTextSummary(){
        this.textSummary = null;
    }

    private removeCommitList(){
        this.commits = null;
    }

    private removeReleaseDescriptions(){
        this.releaseDescriptions = null;
    }

}