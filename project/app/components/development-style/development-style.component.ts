/**
 * Created by thanosp on 17/4/2017.
 */
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import * as $ from 'jquery';
import {CochangedService} from '../../services/cochangedFiles.service';
import * as d3 from 'd3/build/d3.js';
import {ProjectService} from "../../services/Projects.services";
import {AuthorsService} from "../../services/authors.service";
import {Project} from "../../shared/Project";
@Component({
    selector: 'development-chart',
    //template: `<ng-content></ng-content>`,
    templateUrl: './development-style.html',
    //styleUrls: ['./change-breakdown.style.css'],
    providers: [CochangedService, AuthorsService]
})

export class DevelopmentChart implements OnInit, OnChanges {

    private cochangedFiles:any;
    private selectedProject:Project = {selectedPrj: '', projectId: -1};


    constructor(private coChangedFilesService:CochangedService, private projectService:ProjectService, private authorsService:AuthorsService){}

    ngOnInit(): void {

        this.projectService.getSelectedProject().subscribe(
            project => {
                this.selectedProject.selectedPrj = project['selectedPrj'];
                this.selectedProject.projectId = project['projectId'];
                this.getCochangedAuthors();
            });

        this.setEventListeners();
        this.getCochangedFiles();
        this.getCochangedAuthors();
        //this.constructChordDiagramData();
    }


    ngOnChanges(): void {
    }

    getCochangedFiles(){
        this.coChangedFilesService.getCochangedFiles()
            .subscribe(releases => {
                    this.cochangedFiles = releases;
                    //console.log(this.cochangedFiles);
                },
                err => {
                    console.log(err);
                }
            );
    }

    getCochangedAuthors(){
        let url = "http://localhost:3002/api/v1/projects/" +
            this.selectedProject.projectId + "/authors?group_by=release";
        d3.select(".development-style svg").remove();
        if( this.selectedProject.projectId != -1){
            this.authorsService.getAuthors(url)
                .subscribe(releases => {
                        //this.cochangedFiles = releases;
                        console.log(releases);
                        this.constructChordDiagramData(releases);
                    },
                    err => {
                        console.log(err);
                    }
                );
        }
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

        console.log(matrix);
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
        console.log(matrix);

        var svg = d3.select(".development-style svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            outerRadius = Math.min(width, height) * 0.5 - 40,
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

        var color = d3.scaleOrdinal(d3.schemeCategory20c)
            //.domain(d3.range(matrix.length))
            //.range(["#000000", "#FFDD89", "#957244", "#F26223"]);

        var g = svg.append("g")
            .attr("transform", "translate(" + (width) / 2  + "," + (height) / 2  + ")")
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
            console.log("yoooaaaaa");
            return function(d, i) {
                svg.selectAll(".ribbons path")
                    .filter(function(d) { console.log(d);return d.source.index != i && d.target.index != i; })
                    .transition()
                    .style("stroke-opacity", opacity)
                    .style("fill-opacity", opacity);
            };
        };
    }



}