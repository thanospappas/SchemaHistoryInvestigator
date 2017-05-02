/**
 * Created by thanosp on 23/4/2017.
 */

import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {Project} from "./Project";


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

    constructor(chartSection) {
        this.chartSection = chartSection;
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
        D3.select(this.chartSection + " svg").remove();
        this.svg = D3.select(".x_content " + this.chartSection).append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)//element.offsetWidth)
            .attr('height', this.height + this.margin.top + this.margin.bottom + this.legendHeight);//element.offsetHeight);

        // chart initMenuListeners area
        this.chart = this.svg.append('g')
            .attr('class', 'bars1')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // define X & Y domains
        let yDomain = [0, D3.max(this.releases, d => d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates)];
        let yDomainRight = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];

        // create scales
        this.xScale = D3.scaleTime().domain([new Date(this.releases[0].dateHuman), new Date(this.releases[this.releases.length - 1].dateHuman)])
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


        //this.newTest();
        this.lala2();

    }







    //not used yet
    createZoomOverview(remapped){
        console.log("yooooooooooooooooooooooooooooooooooooooooooooooooooooo");
        var lala = this.xScale;
        this. xOverview = D3.scaleTime().range([0, this.width]);
        var yOverview = D3.scaleLinear().range([this.heightOverview, 0]);
        var xAxisOverview = D3.axisBottom().scale(this.xOverview);
        var overview = this.svg.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + this.marginOverview.left + "," + 200+ ")");
        var parseDate = D3.timeFormat("%Y-%m-%d ");

        var brush = D3.brushX(this.xOverview)
            .extent([parseDate("2004-08-11"), parseDate("2008-08-11")])
            .on("brush", brushed);

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
            .call(brush)
            .selectAll("rect")
            // -6 is magic number to offset positions for styling/interaction to feel right
            .attr("y", -6)
            // need to manually set the height because the brush has
            // no y scale, i.e. we should see the extent being marked
            // over the full height of the overview chart
            .attr("height", 200 + 7);  // +7 is magic number for styling


        function  brushed() {
            console.log(lala);
            // update the main chart's x axis data range
            lala.domain(brush.empty() ? this.xOverview.domain() : brush.extent());
            // redraw the bars on the main chart
            this.chart.selectAll(".bars")
                .attr("transform", function(d) { return "translate(" + this.xScale(d.date) + ",0)"; })
            // redraw the x axis of the main chart
            this.chart.select(".x.axis").call(this.xAxis);
        }
    }



    newTest(){
        var margin = {top: 10, right: 10, bottom: 100, left: 50},
            margin2 = {top: 430, right: 10, bottom: 20, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 500 - margin2.top - margin2.bottom;

        var currentRange;

        var parseDate = D3.timeFormat("%y-%m-%d")  ;


// sample of data (for Fiddle purposes only)
        var dataset = [
            {"time": "2014-08-12", "Minutes": "40", "err":"10.11"},
            {"time": "2014-08-12", "Minutes": "29", "err":"0.44"},
            {"time": "2014-08-12", "Minutes": "25", "err":"-2.1"},
            {"time": "2014-08-12", "Minutes": "26", "err":"3.7"},
            {"time": "2014-08-12", "Minutes": "10", "err":"2.23"},
            {"time": "2014-08-11", "Minutes": "34", "err":"4.4"},
            {"time": "2014-08-11", "Minutes": "34", "err":"2"},
            {"time": "2014-08-11", "Minutes": "54", "err":"9"},
            {"time": "2014-08-11", "Minutes": "4", "err":"-5"}
        ];

// determines color for tooltip text
        var getColor = function(d) {
            if(d < 0) {return "green"}
            else {return "red"}
        };



// setup x
        var x = D3.scaleTime().range([0, width]),
            x2 = D3.scaleTime()
                .domain([
                    parseDate("2014-08-11 05:30:00"),
                    parseDate("2014-08-12 19:25:00")
                ])
                .nice(D3.timeMinute)
                .range([0, width]),
            xMap = function(d) { return x(d.time); }
        var y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);
        var yMap = function(d) { return y(d.Minutes); } // data -> display

        var inRange = function(d) {
            if(!currentRange || d.time < currentRange[0] || d.time > currentRange[1] ) {
                return 0;
            } else {
                return 6;
            }
        }

// setup y
        var xAxis = D3.axisBottom(x),//D3.svg.axis().scale(x).orient("bottom"),
            xAxis2 = D3.axisBottom(x2),//D3.svg.axis().scale(x2).orient("bottom"),
            yAxis = D3.axisLeft(y)//D3.svg.axis().scale(y).orient("left");

// setup fill color
        var cValue = D3.scaleLinear()
            .domain([-15, -6, 0, 6, 15])
            .range(["forestgreen", "green", "white", "red", "firebrick"]);

//setting up brush and defaultExtent
        var brush = D3.brushX()
            .extent([parseDate("2014-08-11 10:20:00"), parseDate("2014-08-11 18:20:00")]) //trying to intialize brush
            .on("brush", brushed);

// add the graph canvas to the body of the webpage
        var svg = D3.select(".x_content " + this.chartSection).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

// y-axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("x", -(height)/2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("prediction (minutes)")
            .style("font-size", "15px");

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//need to define scatter plot globally
        var mydots = focus.append("g");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// add the tooltip area to the webpage
        var tooltip = D3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        initialize();


        function initialize() {
            x.domain(D3.extent(dataset.map(function(d) { return d.time; })));
            y.domain([0, D3.max(dataset.map(function(d) { return d.Minutes; }))]);
            x2.domain(x.domain());
            y2.domain(y.domain());

            focus.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            focus.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            //brush slider display
            context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

            // brush slider display
            /*context.append("g")
                .attr("class", "x brush")
                .call(brush)
                .call(D3.brushSelection)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", height2 + 7);*/

            context.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, x.range());


            // draw dots
            mydots.selectAll(".circle") //seems like you can put anything in  the selectAll("")
                .data(dataset)
                .enter().append("circle")
                .attr("class", "circle")
                .attr("r", 6)
                .attr("cx", (d,i) => { console.log(x(d.time)); return x(d.time)} )
                .attr("cy", yMap)
                .style("fill", function(d) {return cValue(d.err)})
                .style("stroke", "black")
                .style("stroke-width", ".3")
                .on("mouseover", function(d) {
                    tooltip.transition()
                        .duration(10)
                        .style("opacity", 1);
                    tooltip.html("prediction: " + d['Minutes'] + " minutes" + "<br>" +
                        //"time: " + timeFormat(d['time']) + "<br>" +
                        "actual: " + (d["err"] + d["Minutes"]) + "<br>" +
                        "bus arrived <span style='color:" + getColor(d["err"]) + "'>"  + (d['err']) + "</span>")
                        .style("left", (D3.event.pageX + 10) + "px")
                        .style("top", (D3.event.pageY - 48) + "px");
                    //.style("font-weight", "bold");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(800)
                        .style("opacity", 0);
                });


        };

        //create brush function redraw scatterplot with selection
        function brushed() {
            var selection = D3.event.selection;
            x.domain(selection.map(x2.invert, x2));
            //focus.selectAll(".dot")
             //   .attr("cx", function(d) { return x(d.date); })
            //   .attr("cy", function(d) { return y(d.price); });
            //focus.select(".axis--x").call(xAxis);

            focus.select(".x.axis").call(xAxis);
            mydots.selectAll(".circle")
                .attr("cx", xMap)
                .attr("cy", yMap)
                .attr("r", inRange);
        }

        /*function brushed() {
            currentRange = (brush.empty()? undefined : brush.extent());
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            focus.select(".x.axis").call(xAxis);
            mydots.selectAll(".circle")
                .attr("cx", xMap)
                .attr("cy", yMap)
                .attr("r", inRange);
            console.log(brush.extent())
        }*/

    }


    lala(){
        /* Adapted from: https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172 */

        var data = [
            {"sent_time": "2014-08-12", "messages_sent_in_day": "40", "err":"10.11"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "29", "err":"0.44"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "25", "err":"-2.1"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "26", "err":"3.7"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "10", "err":"2.23"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"4.4"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"2"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "54", "err":"9"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "4", "err":"-5"}
        ];


        var margin = {top: 20, right: 20, bottom: 90, left: 50},
            margin2 = {top: 230, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            height2 = 300 - margin2.top - margin2.bottom;

        var parseTime = D3.timeParse("%Y-%m-%d");

        var x = D3.scaleTime().range([0, width]),
            x2 = D3.scaleTime().range([0, width]),
            y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);

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

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// Data Load from CSV


            data.forEach(function(d) {
                d.sent_time = parseTime(d.sent_time);
            });

            var xMin = D3.min(data, function(d) { return d.sent_time; });
            var yMax = Math.max(20, D3.max(data, function(d) { return d.messages_sent_in_day; }));

            x.domain([xMin, new Date()]);
            y.domain([0, yMax]);
            x2.domain(x.domain());
            y2.domain(y.domain());

            var num_messages = function(dataArray, domainRange) { return D3.sum(dataArray, function(d) {
                return d.sent_time >= domainRange.domain()[0] && d.sent_time <= domainRange.domain()[1];
            })
            }

            // append scatter plot to main chart area
            var messages = focus.append("g");
            messages.attr("clip-path", "url(#clip)");
            messages.selectAll("message")
                .data(data)
                .enter().append("circle")
                .attr('class', 'message')
                .attr("r", 4)
                .style("opacity", 0.4)
                .attr("cx", function(d) { return x(d.sent_time); })
                .attr("cy", function(d) { return y(d.messages_sent_in_day); })

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
                .text("Messages (in the day)");

            focus.append("text")
                .attr("x", width - margin.right)
                .attr("dy", "1em")
                .attr("text-anchor", "end")
                .text("Messages: " + num_messages(data, x));

            svg.append("text")
                .attr("transform",
                    "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                    (height + margin.top + margin.bottom) + ")")
                .style("text-anchor", "middle")
                .text("Date");

            //svg.append("rect")
            //    .attr("class", "zoom")
            //    .attr("width", width)
            //    .attr("height", height)
            //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
             //   .call(zoom);

            // append scatter plot to brush chart area
            var messages = context.append("g");
            messages.attr("clip-path", "url(#clip)");
            messages.selectAll("message")
                .data(data)
                .enter().append("circle")
                .attr('class', 'messageContext')
                .attr("r",3)
                .style("opacity", .6)
                .attr("cx", function(d) { return x2(d.sent_time); })
                .attr("cy", function(d) { return y2(d.messages_sent_in_day); })

            context.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

            context.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, x.range());



//create brush function redraw scatterplot with selection
        function brushed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = D3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            focus.selectAll(".message")
                .attr("cx", function(d) { return x(d.sent_time); })
                .attr("cy", function(d) { return y(d.messages_sent_in_day); });
            focus.select(".x-axis").call(xAxis);
            svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = D3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.selectAll(".message")
                .attr("cx", function(d) { return x(d.sent_time); })
                .attr("cy", function(d) { return y(d.messages_sent_in_day); });
            focus.select(".x-axis").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }
    }

    lala2(){
        /* Adapted from: https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172 */

        /*var data = [
            {"sent_time": "2014-08-12", "messages_sent_in_day": "40", "err":"10.11"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "29", "err":"0.44"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "25", "err":"-2.1"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "26", "err":"3.7"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "10", "err":"2.23"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"4.4"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"2"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "54", "err":"9"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "4", "err":"-5"}
        ];*/

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


        var margin = {top: 20, right: 20, bottom: 90, left: 50},
            margin2 = {top: 230, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 300 - margin2.top - margin2.bottom;

        var parseTime = D3.timeParse("%Y-%m-%d");

        var x = D3.scaleTime().range([0, width-margin.left]),
            x2 = D3.scaleTime().range([0, width-margin.left]),
            y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);

        let yDomainRight = [0, D3.max(this.releases, d => d.stats.averageSchemaSizeTables)];

        // create scales

        var yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);





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



        var xMin = D3.min(remapped, (d) =>{ return new Date(d.x); });
        var xMax = D3.max(remapped, (d) =>{ return new Date(d.x); });
        var yMax = Math.max(20, D3.max(remapped, function(d) { return d.y; }));

        console.log(xMin +"," + xMax);

        //x.domain([xMin, xMax]);
        x.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);
        y.domain([0, yMax]);
        y.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);
        x2.domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);
        //domain(x.domain());
        y2.domain(y.domain());

        var currentExtent = [0,0]


        //this.createZoomOverview(remapped);
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
                console.log(d.x);
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
            .text("Messages (in the day)");

        focus.append("text")
            .attr("x", width - margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end")
            //.text("Messages: " + num_messages(data, x));

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        //svg.append("rect")
        //    .attr("class", "zoom")
        //    .attr("width", width)
        //    .attr("height", height)
        //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //   .call(zoom);

        // append scatter plot to brush chart area
        /*var messages = context.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("circle")
            .attr('class', 'messageContext')
            .attr("r",3)
            .style("opacity", .6)
            .attr("cx", function(d) { return x2(d.sent_time); })
            .attr("cy", function(d) { return y2(d.messages_sent_in_day); })*/

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



        context.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        var myline;
        this.createLineChart()
            .then((res) =>{
                myline =res;
                focus.append("path")
                    .datum(this.releases)
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", "#5E5A59")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", res);
            });
        /*svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);*/


        /*var focusLine = D3.line()
            .x(function(d) {
                console.log("-----------------------------------------------");
                console.log(d);
                return x(d.humanDate); })
            .y(function(d) { return y(d.stats.averageSchemaSizeTables); })
            .defined(function(d) { return d.stats.averageSchemaSizeTables; });*/

        var focusLine = D3.line()

            .x(function(d) {
                console.log("-----------------------------------------------");
                console.log(x(d.dateHuman));
                return x(new Date(d.dateHuman)); })
            .y(function(d) { console.log(d); return yScaleRight(d.stats.averageSchemaSizeTables)});

        focusLine.curve(D3.curveStepAfter);

        svg.selectAll('path.line')
            .datum(this.releases)
            .attr("class", "line")
            .attr("d", focusLine);

       // var line = svg.selectAll('path.line').append("path").attr("class", "line")
            //.data(data)
        //    .attr("d",this.releases);

        //line.enter().append('path')
        //    .attr("class", "line");


        //line.transition()
        //    .attr('d', function(d) { return focusLine(d); });

        //line.exit().remove();





//create brush function redraw scatterplot with selection
        function brushed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = D3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));

            //console.log(s.map(x2.invert, x2))
            focus.selectAll("rect")
                .attr('x', d => {
                    //console.log(d.x);
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
                })




            focus.selectAll("path.line").attr("d", focusLine);
            //focus.select(".line").attr("d", myline);
            //focus.select(".x-axis").call(xAxis);
            //focus.selectAll("path.line").attr("d",  d => {
             //   console.log(d.values);
             //   return myline
            //});
            svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));


            /*focus.select(".line")
                .attr("x", d => x(new Date(d.dateHuman)))
                .attr("y", d => {
                    console.log(d);
                    return this.yScaleRight(parseFloat(d.stats.averageSchemaSizeTables));
                });*/


                //.attr("cx", function(d) { return x(d.sent_time); })
                //.attr("cy", function(d) { return y(d.messages_sent_in_day); });
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
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }
    }


    lala1(){

        var data = [
            {"sent_time": "2014-08-12", "messages_sent_in_day": "40", "err":"10.11"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "29", "err":"0.44"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "25", "err":"-2.1"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "26", "err":"3.7"},
            {"sent_time": "2014-08-12", "messages_sent_in_day": "10", "err":"2.23"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"4.4"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "34", "err":"2"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "54", "err":"9"},
            {"sent_time": "2014-08-11", "messages_sent_in_day": "4", "err":"-5"}
        ];


        var margin = {top: 20, right: 20, bottom: 90, left: 50},
            margin2 = {top: 230, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            height2 = 300 - margin2.top - margin2.bottom;
        var parseTime = D3.timeParse("%Y-%m-%d");


        var x = D3.scaleTime().range([0, width]),
            x2 = D3.scaleTime().range([0, width]),
            y = D3.scaleLinear().range([height, 0]),
            y2 = D3.scaleLinear().range([height2, 0]);


        var xAxis = D3.axisBottom(x).tickSize(0),
            xAxis2 = D3.axisBottom(x2).tickSize(0),
            yAxis = D3.axisLeft(y).tickSize(0);
/////////////////////////////////////////////////////////////////

        // update scales & axis
        //this.xScale = D3.scaleTime().range([0, width - margin.right - margin.left-this.barWidth]).domain([new Date(this.releases[0].dateHuman),
            //new Date(this.releases[this.releases.length - 1].dateHuman)]);
        //var x2 = D3.scaleTime().range([0, width - margin.right - margin.left-this.barWidth]).domain([new Date(this.releases[0].dateHuman),
            //new Date(this.releases[this.releases.length - 1].dateHuman)]);


        //this.yScale.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        ///d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);

        var y2 = D3.scaleLinear().range([height2, 0]);
        y2.domain(this.yScale.domain());

        //this.xAxis = D3.axisBottom(this.xScale).tickSize(0);
           /* .call(D3.axisBottom(this.xScale)
                .ticks(D3.timeMonth, 2)
                .tickSize(2)
                .tickFormat(D3.timeFormat("%d-%m-%y"))

            ).selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("dx", "-1.9em")
            .attr("transform", "rotate(-68)")
            .style("text-anchor", "end");*/

        var xAxis2 = D3.axisBottom(x2).tickSize(0);

        //this.yAxis = D3.axisLeft(this.yScale).tickSize(0);


        //this.yAxis.transition().call(D3.axisLeft(this.yScale));



        //let yDomainRight = [0, D3.max(this.releases, d =>{
        //    return parseFloat(d.stats.averageSchemaSizeTables);
        //} )];








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

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



        data.forEach(function(d) {
            d.sent_time = parseTime(d.sent_time);
        });

        var xMin = D3.min(data, function(d) { return d.sent_time; });
        var yMax = Math.max(20, D3.max(data, function(d) { return d.messages_sent_in_day; }));

        this.xScale.domain([xMin, new Date()]);
        this.yScale.domain([0, yMax]);
        x2.domain(this.xScale.domain());
        y2.domain(this.yScale.domain());

        var num_messages = function(dataArray, domainRange) { return D3.sum(dataArray, function(d) {
            return d.sent_time >= domainRange.domain()[0] && d.sent_time <= domainRange.domain()[1];
        })
        }

        // append scatter plot to main chart area
        var messages = focus.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("circle")
            .attr('class', 'message')
            .attr("r", 4)
            .style("opacity", 0.4)
            .attr("cx", (d) => { return this.xScale(d.sent_time); })
            .attr("cy", (d) => { return this.yScale(d.messages_sent_in_day); })

        focus.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(this.xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(this.yAxis);

        // Summary Stats
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Messages (in the day)");

        focus.append("text")
            .attr("x", width - margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end")
            .text("Messages: " + num_messages(data, this.xScale));

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");


        // append scatter plot to brush chart area
        var messages = context.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("circle")
            .attr('class', 'messageContext')
            .attr("r",3)
            .style("opacity", .6)
            .attr("cx", function(d) { return x2(d.sent_time); })
            .attr("cy", function(d) { return y2(d.messages_sent_in_day); })

        context.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, this.xScale.range());


        var xScale= this.xScale;
        var yScale= this.yScale;
        var xAxis= this.xAxis;

//create brush function redraw scatterplot with selection
        function brushed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = D3.event.selection || x2.range();
            xScale.domain(s.map(x2.invert, x2));
            focus.selectAll(".message")
                .attr("cx", (d) => { return xScale(d.sent_time); })
                .attr("cy", (d) => { return xScale(d.messages_sent_in_day); });
            focus.select(".x-axis").call(xAxis);
            svg.select(".zoom").call(zoom.transform, D3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (D3.event.sourceEvent && D3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = D3.event.transform;
            xScale.domain(t.rescaleX(x2).domain());
            focus.selectAll(".message")
                .attr("cx", (d) => { return xScale(d.sent_time); })
                .attr("cy", (d) => { return yScale(d.messages_sent_in_day); });
            focus.select(".x-axis").call(xAxis);
            context.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));
        }
    }




    updateChart() {


        // update scales & axis
        this.xScale = D3.scaleTime().range([0, this.width - this.margin.right - this.margin.left-this.barWidth]).domain([new Date(this.releases[0].dateHuman),
            new Date(this.releases[this.releases.length - 1].dateHuman)]);

        console.log(this.xScale.domain());

        this.yScale.domain([0, D3.max(this.releases, d => (d.stats.attributeInsertionsAtExistingTables +
        d.stats.attributesDeletedAtDeletedTables + d.stats.attributesUpdates))]);

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
            return parseFloat(d.stats.averageSchemaSizeTables);
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


        //this.createZoomOverview(remapped);
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
                console.log(i);
                if(d.catID > 0){
                    let yminus:number = 0;
                    for(let iter=0;iter<d.catID;iter++){
                        yminus += this.height - this.yScale(remapped[d.catID-(iter+1)][i].y);
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
            .attr("cx", d => this.xScale(new Date(d.dateHuman))+2.5 )
            .attr("cy", d => this.height+2)
            .attr("stroke", "#bb19c4")
            .attr("stroke-width", 1)
            .style("fill", "#313232");


        this.createLegend();

    }

    public createLineChart():Promise<any>{
        return new Promise((resolve) => {
            this.line = D3.line()
                .x(d => this.xScale(new Date(d.dateHuman)))
                .y((d) => {
                    return this.yScaleRight(parseFloat(d.stats.averageSchemaSizeTables));
                });
            resolve(this.line);

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