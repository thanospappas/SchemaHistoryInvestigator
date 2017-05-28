/**
 * Created by thanosp on 17/4/2017.
 */
import { Component, OnInit, OnChanges}  from '@angular/core';
import * as $ from 'jquery';
import {HttpService} from '../../../services/http.service';
import * as d3 from 'd3/build/d3.js';
import {ProjectService} from "../../../services/Projects.services";
import {Project} from "../../../shared/Project";
import {ReleaseService} from "../../../services/releases.service";
import {serverPort} from "../../../config/server-info";
import {DescriptiveStatsLevel} from "../../story-generated/level1/desciptive-stats.component";
import {DescriptiveStatsService} from "../../../services/story-level1-service";
@Component({
    selector: 'development-chart',
    templateUrl: './development-style.html',

})

export class DevelopmentChart implements OnInit, OnChanges {

    private cochangedFiles:any;
    private selectedProject:Project = {selectedPrj: '', projectId: -1};
    private authors;
    private showSuccess = false;

    constructor(private httpService:HttpService, private projectService:ProjectService, private releaseChanges:ReleaseService,
            private descriptiveStatsService:DescriptiveStatsService){}

    ngOnInit(): void {

        this.projectService.getSelectedProject().subscribe(
            project => {
                this.selectedProject.selectedPrj = project['selectedPrj'];
                this.selectedProject.projectId = project['projectId'];
                if(this.selectedProject.projectId != -1){
                    this.getCochangedAuthors();
                    this.getCochangedFiles();
                    this.getAuthors();
                    this.getTables();
                }

            });

        this.releaseChanges.getReleaseChanges().subscribe(
            releases => {
                this.createCommitChart(releases);
                this.createDurationChart(releases);
            });

        this.setEventListeners();
        if(this.selectedProject.projectId != -1) {
            this.getCochangedFiles();
            this.getCochangedAuthors();
            this.getAuthors();
            this.getTables();
        }
        //this.constructChordDiagramData();


    }

    test(data){

        function truncate(str, maxLength, suffix) {
            if(str.length > maxLength) {
                str = str.substring(0, maxLength + 1);
                str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
                str = str + suffix;
            }
            return str;
        }

        var margin = {top: 20, right: 200, bottom: 0, left: 20},
            width = 1000,
            height = 650;

        var start_year = 0,
            end_year = d3.max(data, d =>{
                return d3.max( d.changes, d1 => {
                        return d1[0];
                    }
                )
            });

        var c = d3.scaleOrdinal(d3.schemeCategory20c);

        var x = d3.scaleLinear().range([0, width]);

        var xAxis = d3.axisTop(x);


        var formatYears = d3.timeFormat("0");
        //xAxis.ticks(d3.timeMonth, 2)
        //    .tickSize(2)
        //    .tickFormat(d3.timeFormat("%y"));

        d3.select(".tables-changes svg").remove();

        var svg = d3.select(".tables-changes").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        x.domain([start_year, end_year]);
        var xScale = d3.scaleLinear()
            .domain([start_year, end_year])
            .range([0, width]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(100," + 0 + ")")
            .call(xAxis);

        for (var j = 0; j < data.length; j++) {
            var g = svg.append("g").attr("class","journal");

            var circles = g.selectAll("circle")
                .data(data[j]['changes'])
                .enter()
                .append("circle");

            var text = g.selectAll("text")
                .data(data[j]['changes'])
                .enter()
                .append("text");

            var rScale = d3.scaleLinear()
                .domain([0, d3.max(data[j]['changes'], function(d) { return d[1]; })])
                .range([2, 9]);

            circles
                .attr("cx", function(d, i) { return xScale(d[0])+100; })
                .attr("cy", j*20+20)
                .attr("r", function(d) { return rScale(d[1]); })
                .style("fill", function(d) { return c(j); }) ;

            text
                .attr("y", j*20+25)
                .attr("x",function(d, i) { return xScale(d[0])-5+100; })
                .attr("class","value")
                .text(function(d){ return d[1]; })
                .style("fill", function(d) { return c(j); })
                .style("display","none");

            g.append("text")
                .attr("y", j*20+25)
                .attr("x",0)
                .attr("class","label")
                .text(truncate(data[j]['tableName'],30,"..."))
                .style("fill", function(d) { return c(j); })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        };

        function mouseover(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","none");
            d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","block");
            d3.select(g).selectAll("text.value").style("display","none");
        }


    }


    ngOnChanges(): void {
    }

    getTables(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.selectedProject.projectId + "/releases?group_by=tables";
        this.httpService.get(url)
            .subscribe(releases => {

                    //console.log(releases);
                    this.test(releases);
                },
                err => {
                    console.log(err);
                }
            );
    }

    getCochangedFiles(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.selectedProject.projectId + "/files_affected";
        this.httpService.get(url)
            .subscribe(releases => {
                    this.cochangedFiles = releases;
                    //console.log(this.cochangedFiles);
                },
                err => {
                    console.log(err);
                }
            );
    }

    getAuthors(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.selectedProject.projectId + "/authors";
        //console.log(url);
        if( this.selectedProject.projectId != -1){
            this.httpService.get(url)
                .subscribe(authors => {
                        this.authors = authors;

                    },
                    err => {
                        console.log(err);
                    }
                );
        }
    }

    getCochangedAuthors(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            this.selectedProject.projectId + "/authors?group_by=release";
        d3.select(".development-style svg").remove();
        if( this.selectedProject.projectId != -1){
            this.httpService.get(url)
                .subscribe(releases => {
                        this.constructChordDiagramData(releases);
                    },
                    err => {
                        console.log(err);
                    }
                );
        }
    }


    createCommitChart(releases){
        let data = [];
        for(let i =0; i <releases.length;i++){
            let d = {yValue: -1, name: '', releaseID: -1};
            d.yValue = releases[i].commitNumber;
            d.name = releases[i].name;
            d.releaseID = i;
            data.push(d);
        }

        this.createBarChart(data, "#commits", "release id",
            ".development-style-commits", 1);
    }

    createDurationChart(releases){
        let data = [];
        for(let i =0; i <releases.length;i++){
            let d = {yValue: -1, name: '', releaseID: -1};
            d.yValue = releases[i].duration;
            d.name = releases[i].name;
            d.releaseID = i;
            data.push(d);
        }

        this.createBarChart(data, "duration in days", "release id",".development-style-durations", 2);
    }


    createBarChart(data, yaxisText, xaxisText, drawSection, cssId){
        let margin = {top: 40, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        var x = d3.scaleLinear().range([0, width- margin.left - margin.right    ]);

        var y = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        d3.select(drawSection + " svg").remove();

        var svg = d3.select(drawSection).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("fill", "#FFFFFF");

        x.domain([0, d3.max(data, d => d.releaseID)]);

        y.domain([0, d3.max(data, function(d) { return d.yValue; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("+ ((width / data.length -2)/2) + "," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");

         var rects =   svg.selectAll(".bar" + cssId)
                .data(data)
                .enter().append("rect")
                .attr("class", "bar" + cssId)
             .attr("fill", "#69B40F")
                .attr("x", function(d) {  return x(d.releaseID); })

                .attr("width", d => (width- margin.left - margin.right) / data.length -2  )
                .attr("y", function(d) { return y(d.yValue); })
                .attr("height", function(d) { return height - y(d.yValue); })

        svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", ".rname-tooltip")
            .text(function(d) {
                return "";
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return  x(d.releaseID);
            })
            .attr("y", function(d) {
                return y(d.yValue);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "#69B40F");

        // now add titles to the axes
        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(-30,"+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text(yaxisText)
            .attr("fill", "#000");;

        svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (width/2) +","+(height+ margin.top + 20 -(100/3))+")")  // centre below axis
            .text(xaxisText)
            .attr("fill", "#000");

        rects
            .on("mouseover", this.mouseoverFunc)
            .on("mousemove", this.mousemoveFunc)
            .on("mouseout", this.mouseoutFunc);



    }

    mouseoverFunc(d) {
        d3.select(".tooltip")
            .style("opacity", "1")
            .html("<div class='tooltip-section'><p><span class='tooltipHeader'>" +d.name + "</p></div>");

        d3.select("rname-tooltip")
            .style("opacity", "1")
            .html("<p><span class='release-name-tooltip'>" +d.name + "</p>");

        d3.select(this)
            .classed("hovered-bar", true);
        // .html("<p><span class='tooltipHeader'>" + d.x + "</span><br>"+ d.component + ": " +d.y + "</p>");

    }

    mousemoveFunc(d) {
        d3.select(".tooltip")
        //this.tooltip
            .style("top", (d3.event.pageY - 5) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
    }

    mouseoutFunc(d) {
        d3.select(this)
            .classed("hovered-bar", false)
        return d3.select(".tooltip").style("opacity", "0"); // this sets it to invisible!
    }


    constructChordDiagramData(releases){
        let matrix = [];
        let auths = [];
        for(let ra of releases) {
            for (let auth of ra.authors) {
                if (auths.indexOf(auth.name) == -1) {
                    auths.push(auth.name);
                }
            }
        }

        //initialize marix with zeros
        for(let a of auths){
            let m = [];
            for(let a of auths){
                m.push(0);
            }
            matrix.push(m);
        }


        for(let ra of releases){

            for(let auth1 of ra.authors) {
                if(ra.authors.length == 1){
                    matrix[auths.indexOf(auth1.name)][auths.indexOf(auth1.name)]+=1;
                    break;
                }
                for (let auth2 of ra.authors) {

                    if (auth1.name !== auth2.name) {
                        matrix[auths.indexOf(auth1.name)][auths.indexOf(auth2.name)]+=1;
                        matrix[auths.indexOf(auth2.name)][auths.indexOf(auth1.name)]+=1;
                    }
                }
            }

        }

        this.createChordDiagram(matrix,auths);

    }


    setEventListeners(){
        $('.collapse-link-dev').on('click', function() {
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


    createChordDiagram(ma, authors){
        var margin=30;
        d3.select(".development-style svg").remove();
        var svg1 = d3.select(".development-style").append("svg")
            .attr('width', 600 + margin)//element.offsetWidth)
            .attr('height', 600 + margin );

        var matrix = [
            [0,  200, 300, 400],
            [ 10, 0, 30, 40],
            [ 200, 300, 0, 500],
            [ 100,   200,  300, 0]
        ];
        matrix = ma;

        var svg = d3.select(".development-style svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            outerRadius = Math.min(width-margin-120, height-margin-120) * 0.5 - 40,
            innerRadius = outerRadius - 30;

        var formatValue = d3.formatPrefix(",.0", 1e3);

        var chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var ribbon = d3.ribbon()
            .radius(innerRadius);

        var color = d3.scaleOrdinal(d3.schemeCategory20c);


        var g = svg.append("g")
            .attr("transform", "translate(" + ((width) / 2.2 + margin ) + "," + ((height) / 2.2+ margin)  + ")")
            .datum(chord(matrix));

        var group = g.append("g")
            .attr("class", "groups")
            .selectAll("g")
            .data(function(chords) { return chords.groups; })
            .enter().append("g")
            .attr("style","group-chords");

        group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
            .attr("d", arc);

        var groupTick = group.selectAll(".group-tick")
            .data(function(d) { return groupTicks(d, 1e3); })
            .enter().append("g")
            .attr("class", "group-tick")
            .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });
        groupTick.append("line")
            .attr("x2", 6);

        let ii=-1;
        groupTick
            .filter(function(d) { return d.value % 5e3 === 0; })
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr('class',"author-name")
            .text(function(d) { ii++; return authors[ii] });



        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });


        /*Make mouse over and out possible*/
        group
            .on("mouseover", fade(.02))
            .on("mouseout", fade(.80));


        /*Show all the text*/
        d3.selectAll("g.group").selectAll("line")
            .transition().duration(100)
            .style("stroke","#000");
        /*Same for the %'s*/
        svg.selectAll("g.group")
            .transition().duration(100)
            .selectAll(".tickLabels").style("opacity",1);
        /*And the Names of each Arc*/
        svg.selectAll("g.group")
            .transition().duration(100)
            .selectAll(".titles").style("opacity",1);


        // Returns an array of tick angles and values for a given group and step.
        function groupTicks(d, step) {
            var k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, step).map(function(value) {
                return {value: value, angle: value * k + d.startAngle};
            });
        }
        /*Returns an event handler for fading a given chord group*/
        function fade(opacity) {
            return function(d, i) {
                svg.selectAll(".ribbons path")
                    .filter(function(d) { return d.source.index != i && d.target.index != i; })
                    .transition()
                    .style("stroke-opacity", opacity)
                    .style("fill-opacity", opacity);
            };
        };
    }

    private showSuccessNotification(){
        this.showSuccess = true;
        setTimeout(() => {
            this.showSuccess = false;
        }, 4000);
    }

    addDeveloperChartToStory(){
        let svg = d3.select("#developers-chord-chart svg");
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);
        this.descriptiveStatsService.addDevelopersChart(inp_xmls);
        this.showSuccessNotification();
    }

    addDeveloperListToStory(){
        this.descriptiveStatsService.addSelectedAuthors(this.authors);
        this.showSuccessNotification();
    }

    addTopFilesToStory(){
        this.descriptiveStatsService.addCochangedFiles(this.cochangedFiles);
        this.showSuccessNotification();
    }

    addCommitChartToStory(){
        let svg = d3.select("#development-style-commits svg");
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);
        this.descriptiveStatsService.addCommitNumChart(inp_xmls);
        this.showSuccessNotification();
    }

    addDurationsChartToStory(){
        let svg = d3.select("#development-style-durations svg");
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);
        this.descriptiveStatsService.addDurationsChart(inp_xmls);
        this.showSuccessNotification();
    }

    addTablesChartToStory(){
        let svg = d3.select("#development-style-tables svg");
        let XMLS = new XMLSerializer();
        let inp_xmls = XMLS.serializeToString(svg._groups[0][0]);
        this.descriptiveStatsService.addTablesChart(inp_xmls);
        this.showSuccessNotification();
    }


}
