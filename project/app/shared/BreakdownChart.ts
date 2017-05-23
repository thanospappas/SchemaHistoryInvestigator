/**
 * Created by thanosp on 23/4/2017.
 */

import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {ReleaseService} from "../services/releases.service";
import {CommitService} from "../services/commits.service";


export class BreakdownChart {

    private margin: any = {top: 20, right: 20, bottom: 90, left: 50};
    private margin2 = {top: 230, right: 20, bottom: 30, left: 50};
    private width = 960 - this.margin.left - this.margin.right;
    private height = 500 - this.margin.top - this.margin.bottom;
    private height2 = 300 - this.margin2.top - this.margin2.bottom;
    private x;
    private x2;
    private y;
    private y2;
    private remapped;
    private xAxis;
    private focusLine;
    private focus;
    private zoom;
    private xAxis2;
    private chart: any;
    private colors: any;
    private barWidth = 5;
    private svg;
    private releases;
    tooltip;
    private chartSection:string;
    private context;
    private yScaleRight2;
    private line;
    private chartOverview:string;
    private releaseService:ReleaseService;
    private commitService:CommitService;
    private project;

    constructor(chartSection:string, chartOverview:string, releaseService:ReleaseService) {
        this.chartSection = chartSection;
        this.releaseService = releaseService;
        this.chartOverview = chartOverview;

    }

    setCommitService(commitService){
        this.commitService = commitService;
    }

    setReleases(releases){
        this.releases = releases;
    }

    setChartSection(chartSection){
        this.chartSection = chartSection;
    }

    setProject(prj){
        this.project = prj;
    }

    createChart() {
        this.tooltip = D3.select("body")
            .append("div")
            .attr("class", "tooltip");

        // bar colors
        this.colors = ["#468966","#B9121B","#FFD34E"];

        this.createSummaryChart();
        this.createOverviewSection();


    }

    createSummaryChart(){
        this.width = $('.x_content ' + this.chartSection).width() - this.margin.left - this.margin.right;
        console.log("Width is: " +this.chartSection);
        if(this.width < 0)
            this.width = 600;
        D3.select(this.chartSection + " svg").remove();
        // update existing bars
        let causes = ["attributeInsertionsAtExistingTables", "attributesDeletedAtDeletedTables", "attributesUpdates"];
        let dd = this.releases;

        this.remapped =causes.map(function(dat,i){
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

        let releaseService = this.releaseService;



        //var parseTime = D3.timeParse("%Y-%m-%d");

        this.x = D3.scaleTime().range([0, this.width-this.margin.left]);
        this.x2 = D3.scaleTime().range([0, this.width-this.margin.left]);
        this.y = D3.scaleLinear().range([this.height, 0]);
        this.y2 = D3.scaleLinear().range([this.height2, 0]);

        let yDomainRight = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];

        // create scales

        let yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);

        this.yScaleRight2 = D3.scaleLinear().domain(yDomainRight).range([40, 0]);


        this.xAxis = D3.axisBottom(this.x).tickSize(0);
        this.xAxis2 = D3.axisBottom(this.x2).tickSize(0);
        let yAxis = D3.axisLeft(this.y).tickSize(0);


        let svg = D3.select(".x_content " + this.chartSection).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.svg = svg;


        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.height);

        let yAxisRight = svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${this.width  }, ${ this.margin.top})`)
            .call(D3.axisRight(yScaleRight));


        yAxisRight.call(D3.axisRight(yScaleRight));

        this.focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


        let xMin = D3.min(this.remapped, (d) =>{
            return D3.min(d, (dd)=> {return new Date(dd.x); });
        });
        let xMax = D3.max(this.remapped, (d) =>{
            return D3.max(d, (dd)=> { return new Date(dd.x); });
        });
        let dateRange = [];
        dateRange.push(xMin);
        dateRange.push(xMax);

        if(this.chartSection == ".summary-chart")
            releaseService.setSelectedReleases(dateRange);
        else if(this.chartSection == '.release-summary')
            this.commitService.setSelectedCommits(dateRange,this.project);

        let yMax = Math.max(20, D3.max(this.remapped, function(d) { return d.y; }));


        this.x.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);
        this.y.domain([0, yMax]);
        this.y.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);
        this.x2.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);

        this.y2.domain(this.y.domain());


        let update = this.focus.selectAll('.layer')
            .data(this.remapped);
        update.exit().remove();

        let layer = this.focus.selectAll(".layer")
            .data(this.remapped)
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
                return this.x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){

                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += this.height - this.y(this.remapped[d.catID-(iter+1)][i].y);
                    }
                    return (this.y(d.y) -yminus);
                }
                return (this.y(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)
            .attr('height', (d) => {
                return (this.height - this.y(d.y) )
            } );

        layer.selectAll('rect')
            .on("mouseover", function() {
                D3.select(this)
                    .classed("hovered-bar", true);

            });

        layer.selectAll('rect')
            .on("mouseout", function () {
                D3.select(this)
                    .classed("hovered-bar", false)
            })  ;

        rects
            .on("mouseover", this.mouseoverFunc)
            .on("mousemove", this.mousemoveFunc)
            .on("mouseout", this.mouseoutFunc);


        this.focus.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

        this.focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // Summary Stats
        this.focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left)
            .attr("x",0 - (this.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("#attributes  ");

        this.focus.append("text")

            .attr("transform","translate(" + ((this.width + this.margin.left)) + " ," +
                (0) + "), rotate(-90)")
            //.attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left)
            .attr("x",0 - (this.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("schema size  ");

        this.focus.append("text")
            .attr("x", this.width - this.margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end");

        svg.append("text")
            .attr("transform",
                "translate(" + ((this.width + this.margin.right + this.margin.left)/2) + " ," +
                (this.height + this.margin.top + this.margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        this.focusLine = D3.line()

            .x((d)=> {   return this.x(new Date(d.dateHuman)); })
            .y((d)=> { return yScaleRight(d.stats.averageSchemaSizeTables)});

        this.focus.append("path")
            .datum(this.releases)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#5E5A59")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", this.focusLine);

        this.focusLine.curve(D3.curveStepAfter);

        svg.selectAll('path.line')
            .datum(this.releases)
            .attr("class", "line")
            .attr("d", this.focusLine);


        this.focus.selectAll(".dot1")
            .data(this.releases)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => this.x(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => this.height+2)
            .attr("stroke", "#bb19c4")
            .attr("stroke-width", 1)
            .style("fill", "#313232");


        this.createLegend();
    }

    zoomed(currentPointer) {
        if (D3.event.sourceEvent && D3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        let t = D3.event.transform;

        currentPointer.x.domain(t.rescaleX(currentPointer.x2).domain());
        currentPointer.focus.selectAll("rect")
            .attr('x', d => {
                return currentPointer.x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += currentPointer.height - currentPointer.y(currentPointer.remapped[d.catID-(iter+1)][i].y);
                    }
                    return (currentPointer.y(d.y) -yminus);
                }
                return (currentPointer.y(d.y));
            });

        currentPointer.focus.select(".x-axis").call(currentPointer.xAxis);
    }

    setSelectedReleases(){
        let s = D3.event.selection || this.x2.range();
        if(this.chartSection == ".summary-chart")
            this.releaseService.setSelectedReleases(s.map(this.x2.invert, this.x2));
        else if(this.chartSection == '.release-summary')
            this.commitService.setSelectedCommits(s.map(this.x2.invert, this.x2),this.project);

    }

    createOverviewSection(){
        D3.select(this.chartOverview + " svg").remove();
        let brush = D3.brushX()
            .extent([[0, 0], [this.width, this.height2]])
            .on("brush", d =>{ this.brushed(this); })
            .on('end', d=>  {this.setSelectedReleases();});

        this.zoom = D3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [this.width, this.height]])
            .extent([[0, 0], [this.width, this.height]])
            .on("zoom", d=>{ this.zoomed(this); });

        //Overview SVG *
        let svgOverview = D3.select(this.chartOverview).append("svg")
            .attr("width", this.width )
            .attr("height", 70);

        let contextOverview = svgOverview.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + this.margin2.left + "," + 0  + ")");

        let layerOverview = contextOverview.selectAll(".layerOverview")
            .data(this.remapped)
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
                return this.x2(new Date(d.x))
            })
            .attr('y', (d,i) =>  {

                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += this.height2 - this.y2(this.remapped[d.catID-(iter+1)][i].y);
                    }
                    return (this.y2(d.y) -yminus);
                }
                return (this.y2(d.y));
            })
            .attr("class", (d,i) => {return "barpos-" + i;})
            .attr('width', d => this.barWidth)
            .attr('height', (d) => {
                return (this.height2 - this.y2(d.y) )
            } );

        contextOverview.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + 40 + ")")
            .call(this.xAxis2);

        contextOverview.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, this.x.range());
        let contextLine = D3.line()
            .x((d) => {return this.x2(new Date(d.dateHuman)); })
            .y((d) => { return this.yScaleRight2(d.stats.averageSchemaSizeTables)});

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
    }


    private brushed(pointer) {

        if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        let s = D3.event.selection || pointer.x2.range();
        pointer.x.domain(s.map(pointer.x2.invert, pointer.x2));


        pointer.focus.selectAll("rect")
            .attr('x', d => {
                return this.x(new Date(d.x))
            })
            .attr('y', (d,i) =>  {
                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += pointer.height - pointer.y(pointer.remapped[d.catID-(iter+1)][i%pointer.remapped[0].length].y);
                    }
                    return (pointer.y(d.y) -yminus);
                }
                return (pointer.y(d.y));
            });

        pointer.focus.selectAll(".dot1")
            .attr("cx", d => pointer.x(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => pointer.height+2);

        pointer.focus.selectAll("path.line").attr("d", pointer.focusLine);
        pointer.svg.select(".zoom").call(pointer.zoom.transform, D3.zoomIdentity
            .scale(pointer.width / (s[1] - s[0]))
            .translate(-s[0], 0));

        pointer.focus.select(".x-axis").call(pointer.xAxis);
        pointer.svg.select(".zoom").call(pointer.zoom.transform, D3.zoomIdentity
            .scale(pointer.width / (s[1] - s[0]))
            .translate(-s[0], 0));

    }

    createLegend(){
        let lala = ["Attributes Inserted at Table Birth","Attributes Deleted at Table Birth","# Attributes Updated"];

        let legend = this.svg.selectAll(".legend")
            .data(lala)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate("+ i * 200 + "," + 0 + ")"; })
            .style("font", "10px sans-serif");

        legend.append("rect")
            .attr("x", this.margin.left + 20)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d,i )=> this.colors[i]);

        legend.append("text")
            .attr("x", this.margin.left + 50  )
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function(d,i) { return lala[i] });
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
            .classed("hovered-bar", false);
        return D3.select(".tooltip").style("opacity", "0"); // this sets it to invisible!
    }

    fadeStackedBarChart(opacity, humanDate){
        this.svg.selectAll(".layer rect")
            .filter(function(d) { return d.x != humanDate; })
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);

        this.svg.selectAll(".dot1")
            .filter(function(d) { return d.dateHuman != humanDate;})
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);
    }



    savetoPng(){
        let svg = document.querySelector( "svg" );
        let svgData = new XMLSerializer().serializeToString( svg );

        let canvas = document.createElement( "canvas" );
        canvas.width = this.width;
        canvas.height = this.height;
        let ctx = canvas.getContext( "2d" );

        let img = document.createElement( "img" );
        img.setAttribute( "src", "data:image/svg+xml;base64," + btoa( svgData ) );
        let w = this.width;
        let h = this.height;
        let filename = "download.png";
        img.onload = function() {
            ctx.drawImage( img, 0, 0 , w,h);
            // Now is done
            console.log( canvas.toDataURL( "image/png" ) );
            let a = document.createElement("a");
            a.download = filename;
            a.href = canvas.toDataURL( "image/png" );
            a.click();
        };
    }



}