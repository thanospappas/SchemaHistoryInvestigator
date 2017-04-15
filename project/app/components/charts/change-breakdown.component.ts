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
        var parseDate = D3.timeParse("%d-%m-%y");
        this.data = [
            { "x": parseDate("10-01-10"), "y": 0.9, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("11-03-10"), "y": 1  , "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("09-09-10"), "y": 0.7, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("25-05-11"), "y": 0.1, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-06-11"), "y": 0  , "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-07-11"), "y": 0.4, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-09-11"), "y": 0  , "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-11-11"), "y": 0.5, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-02-12"), "y": 0.1, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-05-12"), "y": 0.4, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-09-12"), "y": 0.3, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-11-12"), "y": 0.4, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-01-13"), "y": 1  , "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-02-13"), "y": 0.8, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-04-14"), "y": 0.8, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-05-14"), "y": 0.2, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-10-15"), "y": 0.3, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-01-16"), "y": 0.5, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-02-16"), "y": 0.4, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("15-09-16"), "y": 0.1, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("09-01-17"), "y": 0.4, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("11-02-17"), "y": 0.1, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("19-02-17"), "y": 0.6, "y1": 0.3, "y2": 0.5 },
            { "x": parseDate("25-03-17"), "y": 0.1, "y1": 0.3, "y2": 0.5 }
            ];
        console.log(this.data);

        this.createChart();


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
        let yDomain = [0, D3.max(this.data, d => d.y + d.y1 + d.y2)];
        let yDomainRight = [0, D3.max(this.data, d => d.y+50)];

        // create scales
        this.xScale = D3.scaleTime().domain([new Date(this.data[0].x), new Date(this.data[this.data.length - 1].x)])
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

        if (this.releases) {
            this.updateChart();
        }

    }

    updateChart() {
        // update scales & axis
        console.log("HAHA chk this out:")
        console.log(this.releases);
        this.xScale = D3.scaleTime().range([0, this.width - this.margin.right - this.margin.left-5]).domain([new Date(this.data[0].x), new Date(this.data[this.data.length - 1].x)]);

        this.yScale.domain([0, D3.max(this.data, d => d.y + d.y1 + d.y2)]);

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




        let update = this.chart.selectAll('.bar')
            .data(this.data);

        // remove exiting bars
        update.exit().remove();

        // update existing bars
        //let stack = D3.stack().keys(["y,y1"]);
        var z = D3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        var z = D3.scaleOrdinal(D3.schemeCategory20);
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var causes = ["y", "y1", "y2"];
        let dd = this.data;
        var stack = D3.stack().keys(causes);
        var layers = stack(this.data);

        let layer = this.chart.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", (d, i) => this.colors[i] ) ;


        layer.selectAll('rect')
            .data(d => d)
            .enter()
            .append("rect")
            .transition()
            .attr('x', d =>
                this.xScale(new Date(d.data.x))
            )
            .attr('y', d =>  this.yScale(d[1]))
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


        // add new bars
       /* update
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => this.xScale(new Date(d.x)))
            .attr('y', d => this.yScale(d[1]))
            .attr('width', 5)//this.width / this.data.length - this.barPadding)
            .attr('height', 0)
            .style('fill', (d, i) => this.colors(i))
            .transition()
            .delay((d, i) => i * 10)
            .attr('y', d => this.height - this.yScale(d[1]))
            .attr('height', d => this.height - this.yScale(d.y + d.y1));
            */

        this.yAxisRight.call(D3.axisRight(this.yScaleRight));
        var line1 = D3.line()
            .x(d => this.xScale(d.x))
            .y((d, i) => (this.yScaleRight(parseInt(d.y) + i*2)));

        this.chart.append("path")
            .datum(this.data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line1);

        // draw dots
        this.chart.selectAll(".dot1")
            .data(this.data)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => this.xScale(new Date(d.x)) )
            .attr("cy", d => this.height)
            .style("fill", "#000");

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