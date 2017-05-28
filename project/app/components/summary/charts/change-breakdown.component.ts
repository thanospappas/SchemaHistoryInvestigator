/**
 * Created by thanosp on 13/4/2017.
 */
import { Component, OnInit, OnChanges, ElementRef, style }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {ReleaseService} from '../../../services/releases.service';
import {ProjectService} from "../../../services/Projects.services";
import {Project} from "../../../shared/Project";
import {serverPort} from "../../../config/server-info";
import {BreakdownChart} from "../../../shared/BreakdownChart";
import {DescriptiveStatsService} from "../../../services/story-level1-service";

@Component({
    selector: 'area-chart',
    templateUrl: './change-breakdown.html',
    styleUrls: ['./change-breakdown.style.css'],
})

export class AreaChart implements OnInit, OnChanges {

    private margin: any = { top: 20, bottom: 90, left: 40, right: 40};
    marginOverview:any;
    heightOverview:any;
    private chart: any;
    private width: number;
    private height: number;

    private svg;
    private releases ;
    private legendHeight:number;
    private isDataAvailable:boolean = true;
    private selectedProject:Project = {selectedPrj: '', projectId: -1};
    loading = false;
    private tooltip;
    private changebreakdownCart;

    private selectedReleases;

    private showSuccess = false;


    constructor(private releaseService:ReleaseService, private projectService:ProjectService,
        private descriptiveStatsService:DescriptiveStatsService) {
        this.getReleases();
    }


    ngOnInit() {
        this.legendHeight = 28;
        this.width = $('.x_content .col-md-9').width();
        this.height = 400;
        this.marginOverview = { top: this.height - 70, right: this.margin.right, bottom: 20,  left: this.margin.left };
        this.heightOverview= this.height - this.marginOverview.top - this.marginOverview.bottom;
        this.margin.top = this.legendHeight;

        this.changebreakdownCart = new BreakdownChart(".summary-chart",".overview-chart",this.releaseService);

        this.projectService.getSelectedProject().subscribe(
            project => {
                this.selectedProject.selectedPrj = project['selectedPrj'];
                this.selectedProject.projectId = project['projectId'];
                this.getReleases();
            });

        this.releaseService.getSelectedReleases().subscribe(
            releases => {
                this.selectedReleases = releases;
            });

        $('.collapse-link').on('click', function() {
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

        $('.close-link').click(function () {
            var $BOX_PANEL = $(this).closest('.x_panel');

            $BOX_PANEL.remove();
        });

        this.tooltip = D3.select("body")
            .append("div")
            .attr("class", "releaseTooltip");

    }

    getReleases(){

        let url = "http://localhost:" + serverPort +"/api/v1/projects/" +
            this.selectedProject.projectId + "/releases";


        /*if(this.releaseService.getReleaseData()){
            this.changebreakdownCart = new BreakdownChart(".summary-chart");
            this.releases = this.releaseService.getReleaseData();
            console.log(this.releases)
            this.changebreakdownCart.setReleases(this.releases);

            this.changebreakdownCart.createChart();
        }

        else */

        if(this.selectedProject.projectId != -1) {
            this.loading = true;
            console.log(this.selectedProject.projectId)
            this.releaseService.getReleases(url)
                .subscribe(releases => {
                        this.releases = releases;
                        this.isDataAvailable = true;
                        this.loading = false;
                        //console.log(this.releases);
                        this.changebreakdownCart.setReleases(this.releases);
                        this.changebreakdownCart.createChart();
                    },
                    err => {
                        console.log(err);
                    }
                );

        }
    }

    ngOnChanges() {    }

    highlighRelease(isHighlight:boolean, index:number, event, release){
        D3.selectAll(".barpos-" + index).classed("hovered-bar", isHighlight);

        /**
         * Display / Hide  the tooltip for the releases
         */
        if(event.type == "mouseover"){
            D3.select(".releaseTooltip")
                .style("opacity", "1")
                .style("position","absolute")
                .style("left", (event.clientX+20) +'px')
                .style("top", (event.clientY+20)+'px')
                .html("<div class='release-tooltip-section'><div class='' style=''> " +
                        "<p><b style='font-size: 1em'>Restructuring</b></p>" +
                        "<p><b>Category of release</b><br>Schema growth: High | Attributes *jected: Moderate" +
                    " | Attributes Updated: Zero"+ "</p></div>" +
                    "<div class=''><p style='padding-top:10px;'><b>More stats</b> <br>Commits:" + release.commitNumber + " | " +
                    "Contributors:" + release.contributorNumber + " | " +
                    "Duration:" + release.duration + " days</p></div> </div>");

            this.changebreakdownCart.fadeStackedBarChart(0.2,release.dateHuman);
        }
        else{
            D3.select(".releaseTooltip")
                .style("opacity", "0");
            this.changebreakdownCart.fadeStackedBarChart(1,release.dateHuman);
        }


    }

    releaseDrillDown(selectedRelease){
        this.releaseService.setSelectedRelease(selectedRelease);

        let $li = $(".releases-menu-item");
        let $currentli = $('#sidebar-menu').find('li.active-sm');
        $currentli.removeClass('active active-sm');
        $li.addClass('active active-sm');
        //$('.right_col').find('.sidebar-tab-pane').removeClass('active');

        $('.right_col').find('.sidebar-tab-pane').fadeOut(400, function () {
            $('.right_col').find('.sidebar-tab-pane').delay().removeClass('active');
        });

        let $selectedTab = $('.right_col').find("#releases");
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

    addSelectedChart(){
        let svg = D3.select(".summary-chart svg");
        let s = new XMLSerializer();
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);

        this.descriptiveStatsService.addChangeBreakdownChart(inp_xmls);
        this.showSuccessNotification();

    }

    addReleasesToStory(){
        this.descriptiveStatsService.setSelectedReleases(this.selectedReleases);
        this.showSuccessNotification();
    }

}