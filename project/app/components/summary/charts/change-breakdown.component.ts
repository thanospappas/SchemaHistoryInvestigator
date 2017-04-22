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
    tooltip;

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

        //this.projectService.projectChanged$.subscribe(value => console.log('Received new subject value: '))
        //this.projectService.activeProject.subscribe(active => console.log('Received new subject value: '));

        this.projectService.getSelectedProject().subscribe(
            project => {
                console.log("In breakdown...");
                console.log(project['projectId']);
                this.selectedProject.selectedPrj = project['selectedPrj'];
                this.selectedProject.projectId = project['projectId'];
                this.getReleases();
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

    }

    getReleases(){
        //console.log(this.se)
        let url = "http://localhost:" + serverPort +"/api/v1/projects/" +
            this.selectedProject.projectId + "/releases";
        console.log(url);
        if(this.selectedProject.projectId != -1) {
            this.loading = true;
            D3.select(".summary-chart svg").remove();
            this.releaseService.getReleases(url)
                .subscribe(releases => {
                        this.releases = releases;
                        this.isDataAvailable = true;
                        console.log(this.releases);
                        D3.select(".summary-chart svg").remove();
                        if (this.releases) {
                            this.createChart();

                        }
                    },
                    err => {
                        console.log(err);
                    }
                );
        }
    }

    ngOnChanges() {
        //EmitterService.get(this.listId).subscribe((releases:Release[]) => { this.getReleases()});
        if (this.releases) {
            this.updateChart();
        }
        //console.log(this.projectService.getProjects());

    }


    createChart() {

        let element = this.chartContainer.nativeElement;

        this.svg = D3.select(".x_content .col-md-9").append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
            .attr('height', this.height + this.margin.top + this.margin.bottom + this.legendHeight);//element.offsetHeight);

        // chart initMenuListeners area
        this.chart = this.svg.append('g')
            .attr('class', 'bars1')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // define X & Y domains
        let yDomain = [0, D3.max(this.releases, d => d.releaseMetrics.attributeInsertionsAtExistingTables +
                                                    d.releaseMetrics.attributesDeletedAtDeletedTables + d.releaseMetrics.attributesUpdates)];
        let yDomainRight = [0, D3.max(this.releases, d => d.releaseMetrics.averageSchemaSizeTables)];

        // create scales
        this.xScale = D3.scaleTime().domain([new Date(this.releases[0].startDateHuman), new Date(this.releases[this.releases.length - 1].startDateHuman)])
            .range([0, this.width-this.margin.right-10]);
        this.yScale = D3.scaleLinear().domain(yDomain).range([this.height, 0]);
        this.yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);


        this.yAxisRight = this.svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${this.width - this.margin.right  }, ${ this.margin.top})`)
            .call(D3.axisRight(this.yScaleRight));

        // bar colors
        this.colors = ["#468966","#B9121B","#FFD34E"];

        // x & y axis
        this.xAxis = this.svg.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(D3.axisBottom(this.xScale).ticks(D3.timeDay, 1)
                .tickFormat(D3.timeFormat("%d-%m-%y")) );

        this.yAxis = this.svg.append('g')
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(D3.axisLeft(this.yScale));

        this.yAxisRight.call(D3.axisRight(this.yScaleRight));

        if (this.releases) {
            this.updateChart();
        }

        this.tooltip = D3.select("body")
            .append("div")
            .attr("class", "tooltip");

        this.loading = false;



        //console.log(this.releases);

    }

    brushed() {
        // update the main chart's x axis data range
        this.xScale.domain(this.brush.empty() ? this.xOverview.domain() : this.brush.extent());
        // redraw the bars on the main chart
        this.chart.selectAll(".bars")
            .attr("transform", function(d) { return "translate(" + this.xScale(d.date) + ",0)"; })
        // redraw the x axis of the main chart
        this.chart.select(".x.axis").call(this.xAxis);
    }

    //not used yet
    createZoomOverview(remapped){
        this. xOverview = D3.scaleTime().range([0, this.width]);
        var yOverview = D3.scaleLinear().range([this.heightOverview, 0]);
        var xAxisOverview = D3.axisBottom().scale(this.xOverview);
        var overview = this.svg.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + this.marginOverview.left + "," + this.marginOverview.top+ ")");
        this. brush = D3.brushX(this.xOverview).on("brush", this.brushed);
        overview.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.heightOverview + ")")
            .call(xAxisOverview);

        this.xOverview.domain(this.xScale.domain());

        yOverview.domain(this.yScale.domain());
        let ovlayer = overview.selectAll(".layer")
            .data(remapped)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", (d, i) => this.colors[i] ) ;


        ovlayer.selectAll('rect')
            .data(d => {
                return d;
            })
            .enter()
            .append("rect")
            .transition()
            .attr('x', d => {
                return this.xScale(new Date(d.x))
            })
            .attr('y', (d,i) =>  {
                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += this.height - this.yScale(remapped[d.catID-(iter+1)][i].y)
                    }
                    return (this.yScale(d.y) -yminus);
                }
                return (this.yScale(d.y));
            })
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (this.height - this.yScale(d.y) )
            } );


        // add the brush target area on the overview chart
        overview.append("g")
            .attr("class", "x brush")
            .call(this.brush)
            .selectAll("rect")
            // -6 is magic number to offset positions for styling/interaction to feel right
            .attr("y", -6)
            // need to manually set the height because the brush has
            // no y scale, i.e. we should see the extent being marked
            // over the full height of the overview chart
            .attr("height", 200 + 7);  // +7 is magic number for styling
    }

    updateChart() {
        // update scales & axis
        this.xScale = D3.scaleTime().range([0, this.width - this.margin.right - this.margin.left-this.barWidth]).domain([new Date(this.releases[0].startDateHuman),
            new Date(this.releases[this.releases.length - 1].startDateHuman)]);

        this.yScale.domain([0, D3.max(this.releases, d => (d.releaseMetrics.attributeInsertionsAtExistingTables +
        d.releaseMetrics.attributesDeletedAtDeletedTables + d.releaseMetrics.attributesUpdates))]);

        this.xAxis
            .call(D3.axisBottom(this.xScale)
                .ticks(D3.timeMonth, 2)
                .tickSize(2)
                .tickFormat(D3.timeFormat("%d-%m-%y"))

            ).selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("dx", "-1.9em")
            .attr("transform", "rotate(-68)")
            .style("text-anchor", "end");

        this.yAxis.transition().call(D3.axisLeft(this.yScale));

        let yDomainRight = [0, D3.max(this.releases, d =>{
            return parseFloat(d.releaseMetrics.averageSchemaSizeTables);
        } )];
        this.yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);





        // update existing bars
        var causes = ["attributeInsertionsAtExistingTables", "attributesDeletedAtDeletedTables", "attributesUpdates"];
        let dd = this.releases;

        var remapped =causes.map(function(dat,i){
            let xx =  dd.map(function(d,ii){
                let yData:number;
                let cat:string;
                if(i == 0){
                    yData = d.releaseMetrics.attributesInsertedAtNewTables;
                    cat = "attributesInsertedAtNewTables";
                }
                else if(i == 1){
                    yData = d.releaseMetrics.attributesDeletedAtDeletedTables;
                    cat = "attributesDeletedAtDeletedTables";
                }
                else{
                    yData = d.releaseMetrics.attributesUpdates;
                    cat = "attributesUpdates";
                }
                return {x: d.startDateHuman, y: yData, cat: cat, catID: i };
           });
            return xx
        });
        //console.log(remapped);

        let update = this.chart.selectAll('.layer')
            .data(remapped);
        update.exit().remove();

        var stack = D3.stack().keys(causes);

        let layer = this.chart.selectAll(".layer")
            .data(remapped)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", (d, i) => this.colors[i] ) ;


        let rects = layer.selectAll('rect')
            .data(d => {
                return d;
            })
            .enter()
            .append("rect")
            //.transition()
            .attr('x', d => {
                return this.xScale(new Date(d.x))
            })
            .attr('y', (d,i) =>  {
                if(d.catID > 0){
                        let yminus:number = 0;
                        for(let iter=0;iter<d.catID;iter++){
                            yminus += this.height - this.yScale(remapped[d.catID-(iter+1)][i].y)
                        }
                        return (this.yScale(d.y) -yminus);
                }
                return (this.yScale(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (this.height - this.yScale(d.y) )
            } );

        //let currentPointer = this;
        layer.selectAll('rect')
            .on("mouseover", function() {
                D3.select(this)
                    .classed("hovered-bar", true);

            });
        var tmp = this.colors;
        layer.selectAll('rect')
            .on("mouseout", function (d, i) {
                D3.select(this)
                    .classed("hovered-bar", false)
        })  ;

        rects
            .on("mouseover", this.mouseoverFunc)
            .on("mousemove", this.mousemoveFunc)
            .on("mouseout", this.mouseoutFunc);

        //this.createZoomOverview(remapped);

        this.createLineChart()
            .then((res) =>{
                this.chart.append("path")
                    .datum(this.releases)
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", "#5E5A59")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", res);
            });



        // draw releases dots
        this.chart.selectAll(".dot1")
            .data(this.releases)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => this.xScale(new Date(d.startDateHuman))+2.5 )
            .attr("cy", d => this.height+2)
            .attr("stroke", "#bb19c4")
            .attr("stroke-width", 1)
            .style("fill", "#313232");


        this.createLegend();

    }

    public createLineChart():Promise<any>{
        return new Promise((resolve) => {
            var line = D3.line()
                .x(d => this.xScale(new Date(d.startDateHuman)))
                .y((d) => {
                    return this.yScaleRight(parseFloat(d.releaseMetrics.averageSchemaSizeTables));
                });
                resolve(line);

        });
    }

    createLegend(){
        let lala = ["Attributes Inserted at Table Birth","Attributes Deleted at Table Birth","# Attributes Updated"]

        var legend = this.svg.selectAll(".legend")
            .data(lala)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate("+ i * 200 + "," + 0 + ")"; })
            .style("font", "10px sans-serif");

        legend.append("rect")
            .attr("x", this.margin.left + 20)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d,i )=> this.colors[i])
        ;

        legend.append("text")
            .attr("x", this.margin.left + 50  )
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function(d,i) { return lala[i] });
       // this.savetoPng();
    }

    highlighRelease(isHighlight:boolean, index:number){
        D3.selectAll(".barpos-" + index).classed("hovered-bar", isHighlight);
        /*if(isHighlight){
            D3.selectAll(".barpos-" + index)
                .classed("hovered-bar", false)
        }
        else{
            D3.selectAll(".barpos-" + index)
                .classed("hovered-bar", false)
        }*/

    }


    mouseoverFunc(d) {
        D3.select(".tooltip")
            //this.tooltip
                .style("opacity", "1")
                .html("<div class='tooltip-section'><p><span class='tooltipHeader'>" +d.y + "</p></div>");
        D3.select(this)
            .classed("hovered-bar", true);
            // .html("<p><span class='tooltipHeader'>" + d.x + "</span><br>"+ d.component + ": " +d.y + "</p>");

    }

    mousemoveFunc(d) {
        D3.select(".tooltip")
        //this.tooltip
            .style("top", (D3.event.pageY - 5) + "px")
            .style("left", (D3.event.pageX + 10) + "px");
    }

    mouseoutFunc(d) {
        D3.select(this)
            .classed("hovered-bar", false)
        return D3.select(".tooltip").style("opacity", "0"); // this sets it to invisible!
    }



   savetoPng(){
       var svg = document.querySelector( "svg" );
       var svgData = new XMLSerializer().serializeToString( svg );

       var canvas = document.createElement( "canvas" );
       canvas.width = this.width;
       canvas.height = this.height;
       var ctx = canvas.getContext( "2d" );

       var img = document.createElement( "img" );
       img.setAttribute( "src", "data:image/svg+xml;base64," + btoa( svgData ) );
        let w = this.width;
        let h = this.height;
       var filename = "download.png";
       img.onload = function() {
           ctx.drawImage( img, 0, 0 , w,h);

           // Now is done
           console.log( canvas.toDataURL( "image/png" ) );
           var a = document.createElement("a");
           a.download = filename;
           a.href = canvas.toDataURL( "image/png" );
           a.click();
       };
   }



}