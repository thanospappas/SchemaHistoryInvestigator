/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import {ReleaseService} from "../../services/releases.service";
import {HttpService} from "../../services/http.service";
import {serverPort} from "../../config/server-info";
import {ProjectService} from "../../services/Projects.services";
import {BreakdownChart} from "../../shared/BreakdownChart";
import * as d3 from 'd3/build/d3.js';

@Component({
    selector: 'releases-comp',
    templateUrl: './releases.html',

})

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

    highlighCommit(isHighlight:boolean, index:number, event, release){
        d3.selectAll(".barpos-" + index).classed("hovered-bar", isHighlight);

        /**
         * Display / Hide  the tooltip for the releases
         */
        if(event.type == "mouseover"){
            d3.select(".releaseTooltip")
                .style("opacity", "1")
                .style("position","absolute")
                .style("left", (event.clientX+20) +'px')
                .style("top", event.clientY+'px')
                .html("<div class='release-tooltip-section'><div class='' style=''> " +
                    "<p><b style='font-size: 1em'>Restructuring</b></p>" +
                    "<p><b>Category of release</b><br>Schema growth: High | Attributes *jected: Moderate" +
                    " | Attributes Updated: Zero"+ "</p></div>" +
                    "<div class=''><p style='padding-top:10px;'><b>More stats</b> <br>Commits:" + release.commitNumber + " | " +
                    "Contributors:" + release.contributorNumber + " | " +
                    "Duration:" + release.duration + " days</p></div> </div>");

            this.commitChangesChart.fadeStackedBarChart(0.2,release.dateHuman);
        }
        else{
            d3.select(".releaseTooltip")
                .style("opacity", "0");
            this.commitChangesChart.fadeStackedBarChart(1,release.dateHuman);
        }


    }


}
