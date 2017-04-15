/**
 * Created by thanosp on 13/4/2017.
 */
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';

import * as d3Axis from 'd3-axis';
import { Release } from '../../../models/project/release';
import {ReleaseService} from '../../services/releases.service';
import { EmitterService } from '../../emmiter.service';

@Component({
    selector: 'area-chart',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./change-breakdown.style.css'],
    providers: [ReleaseService]
})

export class AreaChart implements OnInit, OnChanges {
    //@ViewChild('chart')
    private chartContainer: ElementRef;
    @Input() private data: Array<any>;
    private margin: any = { top: 20, bottom: 90, left: 40, right: 40};
    private chart: any;
    private width: number;
    private height: number;
    private xScale: any;
    private yScale: any;
    private colors: any;
    private xAxis: any;
    private yAxis: any;
    private barPadding = 1;
    private yAxisRight: any;
    private yScaleRight:any;

    private releases ;
    // Input properties
    @Input() listId: string;
    @Input() editId: string;

    constructor(private element: ElementRef, private releaseService:ReleaseService) {
        this.chartContainer = element;
        //this.releases = new Array<Release>();
    }

    ngOnInit() {
        this.getReleases();


       // this.createChart();


        //if (this.releases) {
         //   this.updateChart();
        //}
    }

    getReleases(){
        this.releaseService.getReleases()
            .subscribe(releases => {
                    this.releases = releases;
                    console.log(this.releases);
                    if (this.releases) {
                        this.createChart();
                    }
                }
                ,//this.releases =
                    err => {
                        console.log(err);
                    }
            );

    }

    ngOnChanges() {
        EmitterService.get(this.listId).subscribe((releases:Release[]) => { this.getReleases()});
        if (this.releases) {
            this.updateChart();
        }
    }

    createChart() {

        let element = this.chartContainer.nativeElement;
        this.width = 900;//element.offsetWidth - this.margin.left - this.margin.right;
        this.height = 400;//element.offsetHeight - this.margin.top - this.margin.bottom;
        let svg = D3.select(element).append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
            .attr('height', this.height + this.margin.top + this.margin.bottom);//element.offsetHeight);

        // chart plot area
        this.chart = svg.append('g')
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


        this.yAxisRight = svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${this.width - this.margin.right  }, ${ this.margin.top})`)
            .call(D3.axisRight(this.yScaleRight));

        // bar colors
        this.colors = ["#468966","#B9121B","#FFD34E"];

        // x & y axis
        this.xAxis = svg.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(D3.axisBottom(this.xScale).ticks(D3.timeDay, 1)
                .tickFormat(D3.timeFormat("%d-%m-%y")) );

        this.yAxis = svg.append('g')
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(D3.axisLeft(this.yScale));

        this.yAxisRight.call(D3.axisRight(this.yScaleRight));


        if (this.releases) {
            this.updateChart();
        }

    }

    updateChart() {
        // update scales & axis
        //console.log("HAHA chk this out:")
        //console.log(this.releases);


        this.xScale = D3.scaleTime().range([0, this.width - this.margin.right - this.margin.left-5]).domain([new Date(this.releases[0].startDateHuman),
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
            console.log(d);
            return parseFloat(d.releaseMetrics.averageSchemaSizeTables);
        } )];
        this.yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);



        let update = this.chart.selectAll('.bar')
            .data(this.releases);

        // remove exiting bars
        update.exit().remove();

        // update existing bars
        //let stack = D3.stack().keys(["y,y1"]);
        var z = D3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        var z = D3.scaleOrdinal(D3.schemeCategory20);
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var causes = ["attributeInsertionsAtExistingTables", "attributesDeletedAtDeletedTables", "attributesUpdates"];
        let dd = this.releases;
        var stack = D3.stack().keys(causes);

        var layers = stack(this.releases);

        let layer = this.chart.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", (d, i) => this.colors[i] ) ;


        /*layer.selectAll('rect')
            .data(d => d)
            .enter()
            .append("rect")
            .transition()
            .attr('x', d => {
                console.log(d.data.releaseMetrics);
                this.xScale(new Date(d.data.startDateHuman))
            })
            .attr('y', d =>  this.yScale(d.data.releaseMetrics))
            .attr('width', d => 5)//this.width / this.data.length - this.barPadding)
            .attr('height', d => (this.yScale(d[0]) - this.yScale(d[1])) );

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
*/


        console.log("haha");
        this.createLineChart()
            .then((res) =>{
                console.log(res);
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



        // draw dots
        this.chart.selectAll(".dot1")
            .data(this.releases)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => this.xScale(new Date(d.startDateHuman)) )
            .attr("cy", d => this.height)
            .style("fill", "#000");


        this.createLegend();


    }

    public createLineChart():Promise<any>{
        return new Promise((resolve) => {
            var line = D3.line()
                .x(d => this.xScale(new Date(d.startDateHuman)))
                .y((d) => {
                    console.log(parseFloat(d.releaseMetrics.averageSchemaSizeTables));
                    //return 20;
                    return this.yScaleRight(parseFloat(d.releaseMetrics.averageSchemaSizeTables));
                });
                resolve(line);

        });
    }

    createLegend(){
        let lala = ["d1fs","d2","d3"]

        var legend = this.chart.selectAll(".legend")
            .data(lala)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
            .style("font", "10px sans-serif");

        legend.append("rect")
            .attr("x", this.width + 18)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d,i )=> this.colors[i])
        ;

        legend.append("text")
            .attr("x", this.width  )
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function(d,i) { return lala[i] });
    }
}