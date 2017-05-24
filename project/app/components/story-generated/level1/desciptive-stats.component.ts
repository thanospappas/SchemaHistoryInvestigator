/**
 * Created by thanosp on 21/5/2017.
 */

import { Component, OnInit }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {DescriptiveStatsService} from "../../../services/story-level1-service";


@Component({
    selector: 'descriptive-stats',
    templateUrl: './descriptive-stats.html'
})

export class DescriptiveStatsLevel implements OnInit {

    private selectedChart;
    private selectedSummary;
    private releases;
    private authors;
    private commitNumChart;
    private durationsChart;
    private tablesChart;
    private developersChart;
    private coChangedFiles;

    constructor (private descriptiveStatsService:DescriptiveStatsService) {}

    ngOnInit(){

        this.waitForChangeBreakdown();
        this.waitForTextSummary();
        this.waitForReleases();
        this.waitForAuthors();
        this.waitDeveloperChart();
        this.waitTopCochangedFiles();
        this.waitCommitNumberChart();
        this.waitDurationsChart();
        this.waitTablesChart();
    }

    private waitForChangeBreakdown(){
        this.descriptiveStatsService.getChangeBreakdownChart().subscribe(
            chart => {
                this.selectedChart = chart;
                let newSvg = document.getElementById('change-breakdown-chart');
                newSvg.innerHTML = this.selectedChart;
            });
    }

    private waitForTextSummary(){
        this.descriptiveStatsService.getTextSummary().subscribe(
            text => {
                this.selectedSummary = text;
            });
    }

    private waitForReleases(){
        this.descriptiveStatsService.getSelectedReleases().subscribe(
            releases => {
                this.releases = releases;
            });
    }

    private waitForAuthors(){
        this.descriptiveStatsService.getSelectedAuthors().subscribe(
            authors => {
                this.authors = authors;
            });
    }

    private waitDeveloperChart(){
        this.descriptiveStatsService.getDevelopersChart().subscribe(
            chart => {
                this.developersChart = chart;
                let newSvg = document.getElementById('developer-chord-chart-story');
                newSvg.innerHTML = this.developersChart;
            });
    }

    private waitTopCochangedFiles(){
        this.descriptiveStatsService.getCochangedFiles().subscribe(
            files => {
                this.coChangedFiles = files;
            });
    }

    private waitCommitNumberChart(){
        this.descriptiveStatsService.getCommitNumChart().subscribe(
            chart => {
                this.commitNumChart = chart;
                let newSvg = document.getElementById('commit-num-chart-story');
                newSvg.innerHTML = this.commitNumChart;
            });
    }

    private waitDurationsChart(){
        this.descriptiveStatsService.getDurationsChart().subscribe(
            chart => {
                this.durationsChart = chart;
                let newSvg = document.getElementById('duration-chart');
                newSvg.innerHTML = this.durationsChart;
            });
    }

    private waitTablesChart(){
        this.descriptiveStatsService.getTablesChart().subscribe(
            chart => {
                this.tablesChart = chart;
                let newSvg = document.getElementById('tables-chart-story');
                newSvg.innerHTML = this.tablesChart;
            });
    }


    removeChangeBreakdownChart(){
       this.selectedChart = null;
       let newSvg = document.getElementById('change-breakdown-chart');
       newSvg.innerHTML = '';
    }

    removeReleaseList(){
        this.releases = null;
    }

    removeAuthors(){
        this.authors = null;
    }

    removeDevelopersChart(){
        this.developersChart = null;
        let newSvg = document.getElementById('developer-chord-chart-story');
        newSvg.innerHTML = '';
    }

    removeFiles(){
        this.coChangedFiles = null;
    }

    removeCommitNumChart(){
        this.commitNumChart = null;
        let newSvg = document.getElementById('commit-num-chart-story');
        newSvg.innerHTML = '';
    }

    removeDurationChart(){
        this.durationsChart = null;
        let newSvg = document.getElementById('duration-chart');
        newSvg.innerHTML = '';
    }

    removeTablesChart(){
        this.tablesChart = null;
        let newSvg = document.getElementById('tables-chart-story');
        newSvg.innerHTML = '';
    }

}