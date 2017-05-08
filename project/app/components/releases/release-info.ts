/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Observable } from 'rxjs/Observable';
import {ReleaseService} from "../../services/releases.service";
import {ActivatedRoute} from "@angular/router";
import {HttpService} from "../../services/http.service";
import {serverPort} from "../../config/server-info";
import {ProjectService} from "../../services/Projects.services";
import {BreakdownChart} from "../../shared/BreakdownChart";


@Component({
    selector: 'releases-comp',
    templateUrl: './releases.html',

})
// Component class implementing OnInit
export class ReleaseComponent implements OnInit {

    private selectedReleaseId:number = -1;
    private releases;
    private selectedReleases;
    private commits;
    private commitChangesChart;

    constructor(private releaseChanges:ReleaseService, private httpService:HttpService, private projectService:ProjectService) {
        this.commitChangesChart = new BreakdownChart(".release-summary",".commit-overview",releaseChanges);
    }

    // Load data ones componet is ready
    ngOnInit() {

        /*this.releaseChanges.getReleaseChanges().subscribe(
            releases => {
                this.releases = releases;
                console.log(releases);
                if(!this.isReleaseSet()){
                    this.selectedReleaseId = releases[0].releaseID;
                }
            });*/

        this.releaseChanges.getSelectedReleases().subscribe(
            releases => {
                this.commits = [];
                this.selectedReleases = releases;
                if(this.selectedReleases.length > 0){
                    this.retrieveSelectedCommits(this.selectedReleases[0].startDate,
                        this.selectedReleases[this.selectedReleases.length-1].startDate);
                }

            });
        this.setEventListeners();
    }

    retrieveSelectedCommits(minDate,maxDate){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/releases?in_range=" + minDate +"," +maxDate;
        this.httpService.get(url)
            .subscribe(commits => {
                    this.commits = commits;
                    console.log(commits);
                    this.commitChangesChart.setReleases(this.commits);
                    this.commitChangesChart.createChart();
                },
                err => {
                    console.log(err);
                }
            );
    }

    retrieveCommits(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/releases/" + this.selectedReleaseId;
        this.httpService.get(url)
            .subscribe(commits => {
                    this.commits = commits;
                    console.log(this.commits);
                    this.commitChangesChart.setReleases(this.commits);
                    //this.commitChangesChart.createChart();

                },
                err => {
                    console.log(err);
                }
            );
    }


    isReleaseSet():boolean{
        if(this.selectedReleaseId == -1)
            return false;

        return true;
    }

    setEventListeners(){
        $('.collapse-link-commit-list').on('click', function() {
            var $BOX_PANEL = $(this).closest('.x_panel'),
                $ICON = $(this).find('i'),
                $BOX_CONTENT = $BOX_PANEL.find('.x_content');

            // fix for some div with hardcoded fix class
            if ($BOX_PANEL.attr('style')) {
                $BOX_CONTENT.slideToggle(200, function(){
                    $BOX_PANEL.removeAttr('style');
                });
            } else {
                $BOX_CONTENT.slideToggle(200);
                $BOX_PANEL.css('height', 'auto');
            }

            $ICON.toggleClass('fa-chevron-up fa-chevron-down');
        });

        $('.close-link-commit-list').click(function () {
            var $BOX_PANEL = $(this).closest('.x_panel');

            $BOX_PANEL.remove();
        });
    }
}
