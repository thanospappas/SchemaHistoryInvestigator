/**
 * Created by thanosp on 23/4/2017.
 */

import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {Project} from "./Project";
import {ReleaseService} from "../services/releases.service";


export class BreakdownChart {

    private margin: any = { top: 20, bottom: 90, left: 40, right: 40};
    private marginOverview:any;
    private heightOverview:any;
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
    //private brush:any;
    private svg;
    private releases;
    private legendHeight:number;
    tooltip;
    private chartSection:string;
    private context;
    private focus;
    private yAxis2;
    private line;
    private releaseService:ReleaseService;

    constructor(chartSection, releaseService:ReleaseService) {
        this.chartSection = chartSection;
        this.releaseService = releaseService;
    }

    setReleases(releases){
        this.releases = releases;
        this.legendHeight = 28;
        this.width = $('.x_content ' + this.chartSection).width();
        this.height = 400;
        this.marginOverview = { top: 480, right: this.margin.right, bottom: 20,  left: this.margin.left };
        this.heightOverview= this.height - this.marginOverview.bottom;
        this.margin.top = this.legendHeight;
    }

    setChartSection(chartSection){
        this.chartSection = chartSection;
    }


    createChart() {
        this.tooltip = D3.select("body")
            .append("div")
            .attr("class", "tooltip");

        // bar colors
        this.colors = ["#468966","#B9121B","#FFD34E"];

        this.createSummaryChart();

    }

    lala4(){

        // update existing bars
        var causes = ["attributeInsertionsAtExistingTables", "attributesDeletedAtDeletedTables", "attributesUpdates"];
        let dd = this.releases;

        var remapped =causes.map(function(dat,i){
            let xx =  dd.map(function(d,ii){
                let yData:number;
                let cat:string;
                if(i == 0){
                    yData = d.stats.attributesInsertedAtNewTables;
                    cat = "attributesInsertedAtNewTables";
                }
                else if(i == 1){
                    yData = d.stats.attributesDeletedAtDeletedTables;
                    cat = "attributesDeletedAtDeletedTables";
                }
                else{
                    yData = d.stats.attributesUpdates;
                    cat = "attributesUpdates";
                }
                return {x: d.dateHuman, y: yData, cat: cat, catID: i };
            });
            return xx
        });
        console.log(remapped);
        let releaseService = this.releaseService;

        var margin = {top: 20, right: 20, bottom: 90, left: 50},
            margin2 = {top: 230, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 300 - margin2.top - margin2.bottom;


        width = $('.x_content ' + this.chartSection).width() - margin.left - margin.right;

        var parseTime = D3.timeParse("%Y-%m-%d");

        var x = D3.scaleTime().range([0, width-margin.left]),
            x2 = D3.scaleTime().range([0, width-margin.left]),
            y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);

        let yDomainRight = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];
        //let yDomainRightOverview = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];
        // create scales

        var yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);

        var yScaleRight2 = D3.scaleLinear().domain(yDomainRight).range([40, 0]);


        var xAxis = D3.axisBottom(x).tickSize(0),
            xAxis2 = D3.axisBottom(x2).tickSize(0),
            yAxis = D3.axisLeft(y).tickSize(0);

        var brush = D3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush", brushed);

        /*var zoom = D3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);*/

        var svg = D3.select(".x_content " + this.chartSection).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        this.svg = svg;

        /*Overview SVG */
        var svgOverview = D3.select(".overview-chart ").append("svg")
            .attr("width", width /* + margin.left + margin.right*/)
            .attr("height", 70/*height + margin.top + margin.bottom*/);

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var yAxisRight = svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${width  }, ${ margin.top})`)
            .call(D3.axisRight(yScaleRight));


        yAxisRight.call(D3.axisRight(yScaleRight));

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + (margin2.top+200) + ")");

        var contextOverview = svgOverview.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + 0 /*(margin2.top+200)*/ + ")");



        var xMin = D3.min(remapped, (d) =>{ return new Date(d.x); });
        var xMax = D3.max(remapped, (d) =>{ return new Date(d.x); });
        var dateRange = [];
        dateRange.push(xMin);
        dateRange.push(xMax);
        console.log(dateRange);
        releaseService.setSelectedReleases(dateRange);
        var yMax = Math.max(20, D3.max(remapped, function(d) { return d.y; }));

        //console.log(xMin +"," + xMax);

        //x.domain([xMin, xMax]);
        x.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);
        y.domain([0, yMax]);
        y.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);
        x2.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);

        y2.domain(y.domain());


        let update = focus.selectAll('.layer')
            .data(remapped);
        update.exit().remove();



        var stack = D3.stack().keys(causes);

        let layer = focus.selectAll(".layer")
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
                return x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height - y(remapped[d.catID-(iter+1)][i].y);
                    }
                    return (y(d.y) -yminus);
                }
                return (y(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (height - y(d.y) )
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





        focus.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // Summary Stats
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("#attributes  ");

        focus.append("text")
            .attr("x", width - margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end");

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");


        let layer1 = context.selectAll(".layer1")
            .data(remapped)
            .enter().append("g")
            .attr("class", "layer1")
            .style("fill", (d, i) => this.colors[i] ) ;


        let rects1 = layer1.selectAll('rect')
            .data(d => {
                return d;
            })
            .enter()
            .append("rect")
            //.transition()
            .attr("clip-path", "url(#clip)")
            .attr('x', d => {
                return x2(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height2 - y2(remapped[d.catID-(iter+1)][i].y);
                    }
                    return (y2(d.y) -yminus);
                }
                return (y2(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (height2 - y2(d.y) )
            } );

        let layerOverview = contextOverview.selectAll(".layerOverview")
            .data(remapped)
            .enter().append("g")
            .attr("class", "layer1")
            .style("fill", (d, i) => this.colors[i] ) ;


        let rectsOverview = layerOverview.selectAll('rect')
            .data(d => {
                return d;
            })
            .enter()
            .append("rect")
            //.transition()
            .attr("clip-path", "url(#clip)")
            .attr('x', d => {
                return x2(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height2 - y2(remapped[d.catID-(iter+1)][i].y);
                    }
                    return (y2(d.y) -yminus);
                }
                return (y2(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (height2 - y2(d.y) )
            } );

        contextOverview.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + 40 + ")")
            .call(xAxis2);

        contextOverview.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());



        context.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());


        var focusLine = D3.line()

            .x(function(d) {
                return x(new Date(d.dateHuman)); })
            .y(function(d) { return yScaleRight(d.stats.averageSchemaSizeTables)});

        focus.append("path")
            .datum(this.releases)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", focusLine);

        focusLine.curve(D3.curveStepAfter);

        svg.selectAll('path.line')
            .datum(this.releases)
            .attr("class", "line")
            .attr("d", focusLine);

        var contextLine = D3.line()
            .x(function(d) {
                return x2(new Date(d.dateHuman)); })
            .y(function(d) { return yScaleRight2(d.stats.averageSchemaSizeTables)});

        contextOverview.append("path")
            .datum(this.releases)
            .attr("class", "lineOverview")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", contextLine);

        contextLine.curve(D3.curveStepAfter);

        focus.selectAll(".dot1")
            .data(this.releases)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => x(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => height+2)
            .attr("stroke", "#bb19c4")
            .attr("stroke-width", 1)
            .style("fill", "#313232");


        this.createLegend();

        //var s = D3.event.selection || x2.range();
        //releaseService.setSelectedReleases(s.map(x2.invert, x2));

        //create brush function redraw scatterplot with selection
        function brushed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = D3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            //var extenttt = brush.extent();
            //var rangeExtent = [x( extenttt ) ];

            releaseService.setSelectedReleases(s.map(x2.invert, x2));
            focus.selectAll("rect")
                .attr('x', d => {
                    return x(new Date(d.x))
                })
                .attr('y', (d,i) =>  {
                    if(d.catID > 0){
                        let yminus:number = 0;
                        for(let iter=0;iter<d.catID;iter++){
                            yminus += height - y(remapped[d.catID-(iter+1)][i%remapped[0].length].y);
                        }
                        return (y(d.y) -yminus);
                    }
                    return (y(d.y));
                });

            focus.selectAll(".dot1")
                .attr("cx", d => x(new Date(d.dateHuman))+2.5 )
                .attr("cy", d => height+2);

            focus.selectAll("path.line").attr("d", focusLine);
            /*svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));

            focus.select(".x-axis").call(xAxis);
            svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));*/
        }

        /*function zoomed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = D3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.selectAll("rect")
                .attr('x', d => {
                    return x(new Date(d.x))
                })
                .attr('y', (d,i) =>  {

                    if(d.catID > 0){
                        let yminus:number = 0;
                        for(let iter=0;iter<d.catID;iter++){
                            yminus += height - y(remapped[d.catID-(iter+1)][i].y);
                        }
                        return (y(d.y) -yminus);
                    }
                    return (y(d.y));
                })
            //.attr("cx", function(d) { return x(d.sent_time); })
            //.attr("cy", function(d) { return y(d.messages_sent_in_day); });
            focus.select(".x-axis").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }*/
    }

    createSummaryChart(){

        // update existing bars
        var causes = ["attributeInsertionsAtExistingTables", "attributesDeletedAtDeletedTables", "attributesUpdates"];
        let dd = this.releases;

        var remapped =causes.map(function(dat,i){
            let xx =  dd.map(function(d,ii){
                let yData:number;
                let cat:string;
                if(i == 0){
                    yData = d.stats.attributesInsertedAtNewTables;
                    cat = "attributesInsertedAtNewTables";
                }
                else if(i == 1){
                    yData = d.stats.attributesDeletedAtDeletedTables;
                    cat = "attributesDeletedAtDeletedTables";
                }
                else{
                    yData = d.stats.attributesUpdates;
                    cat = "attributesUpdates";
                }
                return {x: d.dateHuman, y: yData, cat: cat, catID: i };
            });
            return xx
        });
        console.log(remapped);
        let releaseService = this.releaseService;

        var margin = {top: 20, right: 20, bottom: 90, left: 50},
            margin2 = {top: 230, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 300 - margin2.top - margin2.bottom;


        width = $('.x_content ' + this.chartSection).width() - margin.left - margin.right;

        var parseTime = D3.timeParse("%Y-%m-%d");

        var x = D3.scaleTime().range([0, width-margin.left]),
            x2 = D3.scaleTime().range([0, width-margin.left]),
            y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);

        let yDomainRight = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];

        // create scales

        var yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);

        var yScaleRight2 = D3.scaleLinear().domain(yDomainRight).range([40, 0]);


        var xAxis = D3.axisBottom(x).tickSize(0),
            xAxis2 = D3.axisBottom(x2).tickSize(0),
            yAxis = D3.axisLeft(y).tickSize(0);

        var brush = D3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush", brushed);

        var zoom = D3.zoom()
         .scaleExtent([1, Infinity])
         .translateExtent([[0, 0], [width, height]])
         .extent([[0, 0], [width, height]])
         .on("zoom", zoomed);

        var svg = D3.select(".x_content " + this.chartSection).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        this.svg = svg;

        /*Overview SVG */
        var svgOverview = D3.select(".overview-chart ").append("svg")
            .attr("width", width /* + margin.left + margin.right*/)
            .attr("height", 70/*height + margin.top + margin.bottom*/);

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var yAxisRight = svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${width  }, ${ margin.top})`)
            .call(D3.axisRight(yScaleRight));


        yAxisRight.call(D3.axisRight(yScaleRight));

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var contextOverview = svgOverview.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + 0 /*(margin2.top+200)*/ + ")");



        var xMin = D3.min(remapped, (d) =>{ return new Date(d.x); });
        var xMax = D3.max(remapped, (d) =>{ return new Date(d.x); });
        var dateRange = [];
        dateRange.push(xMin);
        dateRange.push(xMax);
        console.log(dateRange);
        releaseService.setSelectedReleases(dateRange);
        var yMax = Math.max(20, D3.max(remapped, function(d) { return d.y; }));


        x.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);
        y.domain([0, yMax]);
        y.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);
        x2.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);

        y2.domain(y.domain());


        let update = focus.selectAll('.layer')
            .data(remapped);
        update.exit().remove();

        let layer = focus.selectAll(".layer")
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
            .attr('x', d => {
                return x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height - y(remapped[d.catID-(iter+1)][i].y);
                    }
                    return (y(d.y) -yminus);
                }
                return (y(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)//this.width / this.data.length - this.barPadding)
            .attr('height', (d,i) => {
                return (height - y(d.y) )
            } );

        //let currentPointer = this;
        layer.selectAll('rect')
            .on("mouseover", function() {
                D3.select(this)
                    .classed("hovered-bar", true);

            });

        layer.selectAll('rect')
            .on("mouseout", function (d, i) {
                D3.select(this)
                    .classed("hovered-bar", false)
            })  ;

        rects
            .on("mouseover", this.mouseoverFunc)
            .on("mousemove", this.mousemoveFunc)
            .on("mouseout", this.mouseoutFunc);


        focus.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // Summary Stats
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("#attributes  ");

        focus.append("text")
            .attr("x", width - margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end");

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");


        let layerOverview = contextOverview.selectAll(".layerOverview")
            .data(remapped)
            .enter().append("g")
            .attr("class", "layer1")
            .style("fill", (d, i) => this.colors[i] ) ;


        let rectsOverview = layerOverview.selectAll('rect')
            .data(d => {
                return d;
            })
            .enter()
            .append("rect")
            .attr("clip-path", "url(#clip)")
            .attr('x', d => {
                return x2(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height2 - y2(remapped[d.catID-(iter+1)][i].y);
                    }
                    return (y2(d.y) -yminus);
                }
                return (y2(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)
            .attr('height', (d,i) => {
                return (height2 - y2(d.y) )
            } );

        contextOverview.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + 40 + ")")
            .call(xAxis2);

        contextOverview.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());


        var focusLine = D3.line()

            .x(function(d) {
                return x(new Date(d.dateHuman)); })
            .y(function(d) { return yScaleRight(d.stats.averageSchemaSizeTables)});

        focus.append("path")
            .datum(this.releases)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", focusLine);

        focusLine.curve(D3.curveStepAfter);

        svg.selectAll('path.line')
            .datum(this.releases)
            .attr("class", "line")
            .attr("d", focusLine);

        var contextLine = D3.line()
            .x(function(d) {
                return x2(new Date(d.dateHuman)); })
            .y(function(d) { return yScaleRight2(d.stats.averageSchemaSizeTables)});

        contextOverview.append("path")
            .datum(this.releases)
            .attr("class", "lineOverview")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", contextLine);

        contextLine.curve(D3.curveStepAfter);

        focus.selectAll(".dot1")
            .data(this.releases)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => x(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => height+2)
            .attr("stroke", "#bb19c4")
            .attr("stroke-width", 1)
            .style("fill", "#313232");


        this.createLegend();


        //create brush function redraw scatterplot with selection
        function brushed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = D3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));


            releaseService.setSelectedReleases(s.map(x2.invert, x2));
            focus.selectAll("rect")
                .attr('x', d => {
                    return x(new Date(d.x))
                })
                .attr('y', (d,i) =>  {
                    if(d.catID > 0){
                        let yminus:number = 0;
                        for(let iter=0;iter<d.catID;iter++){
                            yminus += height - y(remapped[d.catID-(iter+1)][i%remapped[0].length].y);
                        }
                        return (y(d.y) -yminus);
                    }
                    return (y(d.y));
                });

            focus.selectAll(".dot1")
                .attr("cx", d => x(new Date(d.dateHuman))+2.5 )
                .attr("cy", d => height+2);

            focus.selectAll("path.line").attr("d", focusLine);
            svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
             .scale(width / (s[1] - s[0]))
             .translate(-s[0], 0));

             focus.select(".x-axis").call(xAxis);
             svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
             .scale(width / (s[1] - s[0]))
             .translate(-s[0], 0));
        }

        function zoomed() {
         if (D3.event.sourceEvent && D3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
         var t = D3.event.transform;
         x.domain(t.rescaleX(x2).domain());
         focus.selectAll("rect")
         .attr('x', d => {
         return x(new Date(d.x))
         })
         .attr('y', (d,i) =>  {

         if(d.catID > 0){
         let yminus:number = 0;
         for(let iter=0;iter<d.catID;iter++){
         yminus += height - y(remapped[d.catID-(iter+1)][i].y);
         }
         return (y(d.y) -yminus);
         }
         return (y(d.y));
         })
         //.attr("cx", function(d) { return x(d.sent_time); })
         //.attr("cy", function(d) { return y(d.messages_sent_in_day); });
         focus.select(".x-axis").call(xAxis);
         //context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
         }
    }

    /*brushed() {
        if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = D3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));

        this.releaseService.setSelectedReleases(s.map(x2.invert, x2));
        focus.selectAll("rect")
            .attr('x', d => {
                return x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {
                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += height - y(remapped[d.catID-(iter+1)][i%remapped[0].length].y);
                    }
                    return (y(d.y) -yminus);
                }
                return (y(d.y));
            });

        focus.selectAll(".dot1")
            .attr("cx", d => x(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => height+2);

        focus.selectAll("path.line").attr("d", focusLine);
    }*/



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

    }


    mouseoverFunc(d) {
        D3.select(".tooltip")
            .style("opacity", "1")
            .html("<div class='tooltip-section'><p><span class='tooltipHeader'>" +d.y + "</p></div>");
        D3.select(this)
            .classed("hovered-bar", true);
        // .html("<p><span class='tooltipHeader'>" + d.x + "</span><br>"+ d.component + ": " +d.y + "</p>");

    }

    mousemoveFunc(d) {
        D3.select(".tooltip")
            .style("top", (D3.event.pageY - 5) + "px")
            .style("left", (D3.event.pageX + 10) + "px");
    }

    mouseoutFunc(d) {
        D3.select(this)
            .classed("hovered-bar", false)
        return D3.select(".tooltip").style("opacity", "0"); // this sets it to invisible!
    }

    fadeStackedBarChart(opacity, humanDate){
        this.svg.selectAll(".layer rect")
            .filter(function(d) { return d.x != humanDate; /*d.source.index != i && d.target.index != i; */})
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);

        this.svg.selectAll(".dot1")
            .filter(function(d) { return d.dateHuman != humanDate; /*d.source.index != i && d.target.index != i; */})
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);
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