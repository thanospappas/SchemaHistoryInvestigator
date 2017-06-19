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
import {CommitService} from "../../services/commits.service";
import {NewlinesFilter} from "../../shared/NewlinesFilter";
import {HighlightsCharacterizationsService} from "../../services/story-level2-service";
declare var tinymce: any;
@Component({
    selector: 'releases-comp',
    templateUrl: './releases.html',

})

export class ReleaseComponent implements OnInit {

    private selectedReleaseId:number = -1;
    private selectedRelease;
    private releases;
    private selectedReleases;
    private commits;
    private commitChangesChart;
    private pageMode = "viewMode";
    private showSuccess = false;
    private specificReleaseOn = false;

    private releaseForEdit;
    private summarySaved = false;
    private editor;

    constructor(private releaseChanges:ReleaseService,
                private httpService:HttpService,
                private projectService:ProjectService,
                private commitService:CommitService,
                private newlinesFilter:NewlinesFilter,
                private highlightService:HighlightsCharacterizationsService) {

        this.commitChangesChart = new BreakdownChart(".release-summary",".commit-overview",releaseChanges);
        this.commitChangesChart.setCommitService(this.commitService);
    }

    isSingleReleaseOn(){
        return this.specificReleaseOn;
    }

    onSelectionChange(option){
        if(option == "release"){
            this.specificReleaseOn = true;
            this.selectedRelease = this.selectedReleases[0];
            this.setSelectedReleaseId();
            this.retrieveCommits();
        }
        else{
            this.specificReleaseOn = false;
            this.retrieveSelectedCommits(this.selectedReleases[0].startDate,
                this.selectedReleases[this.selectedReleases.length-1].startDate);
        }
    }

    setSelectedReleaseId(){
        this.selectedReleaseId = this.selectedRelease.releaseID;
        this.retrieveCommits();
    }

    setReleaseForEdit(release){
        this.releaseForEdit = release;
        console.log(this.releaseForEdit);
        console.log(tinymce);
        tinymce.activeEditor.setContent(this.newlinesFilter.transform(this.releaseForEdit.releaseSummary));
    }

    updateReleaseSummary(){
        console.log(tinymce.activeEditor.getContent());
        const url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.projectService.getSelectedProjectData().projectId + "/releases/" + this.releaseForEdit.releaseID;
        this.httpService.update(url,{commitSummary: tinymce.activeEditor.getContent()});
        this.summarySaved = true;
        for(let release of this.selectedReleases){
            if(release.releaseID == this.releaseForEdit.releaseID){
                release.releaseSummary = tinymce.activeEditor.getContent();
            }
        }
    }

    getNewInfo(){
        this.summarySaved = false;
        //this.releaseChanges.setSelectedReleases(this.selectedReleases);
        /*let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
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
            );*/
    }

    // Load data ones componet is ready
    ngOnInit() {
        this.projectService.getSelectedProject().subscribe(
            project => {
                let selectedProject = {selectedPrj: -1, projectId:-1};
                selectedProject.selectedPrj = project['selectedPrj'];
                selectedProject.projectId = project['projectId'];
                this.commitChangesChart.setProject(selectedProject);

            });

       this.releaseChanges.getSelectedReleases().subscribe(
            releases => {
                this.commits = [];
                this.selectedReleases = releases;
                if(this.selectedReleases.length > 0){
                    this.retrieveSelectedCommits(this.selectedReleases[0].startDate,
                        this.selectedReleases[this.selectedReleases.length-1].startDate);
                }

            });

        /**
         * This is called when a user clicks on a release
         * in the summary section
         */
       this.releaseChanges.getSelectedRelease().subscribe(
            release => {
                this.selectedRelease = release;
                this.specificReleaseOn = true;
                this.setSelectedReleaseId();
            });

        this.commitService.getSelectedCommits().subscribe(
            commits => {
                this.commits = commits;
            });

       this.setEventListeners();
    }

    ngAfterViewInit() {
        tinymce.init({
            selector: '#' + 111,
            plugins: ['paste'],
            skin_url: '../public/assets/skins/lightgray',
            height : "380",
            setup: editor => {
                this.editor = editor;
                console.log(editor);
                editor.on('keyup', () => {
                    const content = editor.getContent();
                });
                editor.fire('ScrollWindow', function(){});
            },

        });
        console.log("iiii");
    }

    retrieveSelectedCommits(minDate,maxDate){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/releases?in_range=" + minDate +"," +maxDate;
        this.httpService.get(url)
            .subscribe(commits => {
                    this.commits = commits;
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
                    this.commitChangesChart.createChart();

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

    highlighCommit(isHighlight:boolean, index:number, event, commit){
        d3.selectAll(".barpos-" + index).classed("hovered-bar", isHighlight);

        /**
         * Display / Hide  the tooltip for the releases
         */
        if(event.type == "mouseover"){
            d3.select(".releaseTooltip")
                .style("opacity", "1")
                .style("position","absolute")
                .style("left", (event.clientX + 20) +'px')
                .style("top", (event.clientY + 20)+'px')
                .html("<div class='release-tooltip-section'><div class='' style=''> " +
                    "<p><b style='font-size: 1em'>Restructuring</b></p>" +
                    "<p><b>Category of release</b><br>Schema growth: High | Attributes *jected: Moderate" +
                    " | Attributes Updated: Zero"+ "</p></div>" );

            this.commitChangesChart.fadeStackedBarChart(0.2,commit.dateHuman);
        }
        else{
            d3.select(".releaseTooltip")
                .style("opacity", "0");
            this.commitChangesChart.fadeStackedBarChart(1,commit.dateHuman);
        }
    }

    showCommitInfo(id:number){

        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/commits/" + id;
        this.commitService.getSelectedCommit(url);

        var $li = $(".commits-menu-item");
        var $currentli = $('#sidebar-menu').find('li.active-sm');
        $currentli.removeClass('active active-sm');
        $li.addClass('active active-sm');
        //$('.right_col').find('.sidebar-tab-pane').removeClass('active');

        $('.right_col').find('.sidebar-tab-pane').fadeOut(400, function () {
            $('.right_col').find('.sidebar-tab-pane').delay().removeClass('active');
        });

        var $selectedTab = $('.right_col').find("#commits");
        //$selectedTab.addClass('active');
        $selectedTab.delay(400).fadeIn(400, function () {
            $selectedTab.addClass('active');
            });
    }

    private showSuccessNotification(){
        this.showSuccess = true;
        setTimeout(() => {
            this.showSuccess = false;
        }, 4000);
    }


    addCommitChartToStory(){
        let svg = d3.select("#release-summary svg");
        let s = new XMLSerializer();
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);
        this.highlightService.addCommitChart(inp_xmls);
        this.showSuccessNotification();
    }

    addReleaseDescriptionstToStory(){
        if(this.isSingleReleaseOn()){
            let release = [];
            release.push(this.selectedRelease);
            this.highlightService.addReleaseDescriptions(release);
        }
        else
            this.highlightService.addReleaseDescriptions(this.selectedReleases);
        this.showSuccessNotification();
    }

    addTextSummaryToStory(){
        this.highlightService.addTextSummary("TODO");
        this.showSuccessNotification();
    }

    addCommitsToStory(){
        this.highlightService.addSelectedCommits(this.commits);
        this.showSuccessNotification();
    }

}
