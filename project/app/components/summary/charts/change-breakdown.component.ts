/**
 * Created by thanosp on 13/4/2017.
 */
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import * as d3Axis from 'd3-axis';
import { Release } from '../../../../models/project/release';
import {ReleaseService} from '../../../services/releases.service';
import {ProjectService} from "../../../services/Projects.services";
import {Project} from "../../../shared/Project";
import {serverPort} from "../../../config/server-info";
import {BreakdownChart} from "../../../shared/BreakdownChart";
import {release} from "os";

@Component({
    selector: 'area-chart',
    templateUrl: './change-breakdown.html',
    styleUrls: ['./change-breakdown.style.css'],
    //providers: [ReleaseService]
})

export class AreaChart implements OnInit, OnChanges {
    //@ViewChild('chart')
    private chartContainer: ElementRef;
    @Input() private data: Array<any>;
    private margin: any = { top: 20, bottom: 90, left: 40, right: 40};
    marginOverview:any;
    heightOverview:any;
    private chart: any;
    private width: number;
    private height: number;
    private xScale: any;
    private yScale: any;
    private colors: any;
    private xAxis: any;
    private yAxis: any;
    private barWidth = 5;
    private yAxisRight: any;
    private yScaleRight:any;
    private xOverview:any;
    private brush:any;
    private svg;
    private releases ;
    private legendHeight:number;
    private isDataAvailable:boolean = true;
    private selectedProject:Project = {selectedPrj: '', projectId: -1};
    loading = false;
    private tooltip;
    private changebreakdownCart;

    private selectedReleases;

    // Input properties
    //@Input() listId: string;
    //@Input() editId: string;

    constructor(private element: ElementRef, private releaseService:ReleaseService, private projectService:ProjectService) {
        this.chartContainer = element;
        this.getReleases();
        console.log($('.x_content .col-md-9').width());

    }


    ngOnInit() {
        this.legendHeight = 28;
        this.width = $('.x_content .col-md-9').width()//900;//element.offsetWidth - this.margin.left - this.margin.right;
        this.height = 400;//element.offsetHeight - this.margin.top - this.margin.bottom;
        this.marginOverview = { top: this.height - 70, right: this.margin.right, bottom: 20,  left: this.margin.left };
        this.heightOverview= this.height - this.marginOverview.top - this.marginOverview.bottom;
        this.margin.top = this.legendHeight;

        this.changebreakdownCart = new BreakdownChart(".summary-chart",this.releaseService);

        this.projectService.getSelectedProject().subscribe(
            project => {
                this.selectedProject.selectedPrj = project['selectedPrj'];
                this.selectedProject.projectId = project['projectId'];

                this.getReleases();
            });

        this.releaseService.getSelectedReleases().subscribe(
            releases => {
                //console.log("In breakdown...");
                //console.log(releases);
                this.selectedReleases = releases;
                //this.test();

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


        console.log("getreleases called!!");
        /*if(this.releaseService.getReleaseData()){
            this.changebreakdownCart = new BreakdownChart(".summary-chart");
            this.releases = this.releaseService.getReleaseData();
            console.log(this.releases)
            this.changebreakdownCart.setReleases(this.releases);

            this.changebreakdownCart.createChart();
        }

        else */if(this.selectedProject.projectId != -1) {
            this.loading = true;
            D3.select(".summary-chart svg").remove();
            D3.select(".overview-chart svg").remove();
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
                .style("top", event.clientY+'px')
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

}