/**
 * Created by thanosp on 13/4/2017.
 */
import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation }  from '@angular/core';
import {AreaChartConfig} from './change-breakdown.config';
import * as D3 from 'd3/build/d3.js';
import * as Moment from 'moment';
import * as d3Axis from 'd3-axis';

@Component({
    selector: 'area-chart',
    template: `<ng-content></ng-content>`,
    styleUrls: ['./change-breakdown.style.css'],
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
    constructor(private element: ElementRef) {
        console.log("yo constructor hereee");
        this.chartContainer = element;
    }

    ngOnInit() {
        var parseDate = D3.timeParse("%d-%m-%y");
        this.data = [
            { "x": parseDate("10-01-10"), "y": 0.9 },
            { "x": parseDate("11-03-10"),"y": 1 },
            { "x": parseDate("09-09-10"), "y": 0.7 },
            { "x": parseDate("25-05-11"),  "y": 0.1 },
            { "x": parseDate("15-06-11"), "y": 0 },
            { "x": parseDate("15-07-11"), "y": 0.4 },
            { "x": parseDate("15-09-11"), "y": 0 },
            { "x": parseDate("15-11-11"), "y": 0.5 },
            { "x": parseDate("15-02-12"), "y": 0.1 },
            { "x": parseDate("15-05-12"), "y": 0.4 },
            { "x": parseDate("15-09-12"), "y": 0.3 },
            { "x": parseDate("15-11-12"), "y": 0.4 },
            { "x": parseDate("15-01-13"), "y": 1 },
            { "x": parseDate("15-02-13"), "y": 0.8 },
            { "x": parseDate("15-04-14"), "y": 0.8 },
            { "x": parseDate("15-05-14"), "y": 0.2 },
            { "x": parseDate("15-10-15"), "y": 0.3 },
            { "x": parseDate("15-01-16"), "y": 0.5 },
            { "x": parseDate("15-02-16"), "y": 0.4 },
            { "x": parseDate("15-09-16"), "y": 0.1 },
            { "x": parseDate("09-01-17"), "y": 0.4 },
            { "x": parseDate("11-02-17"), "y": 0.1 },
            { "x": parseDate("12-02-17"), "y": 0.6 },
            { "x": parseDate("25-03-17"), "y": 0.1 }
            ];
        console.log(this.data);
        this.createChart();


        if (this.data) {
            this.updateChart();
        }
    }

    ngOnChanges() {
        if (this.chart) {
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
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // define X & Y domains
        let xDomain = this.data.map(d => d.x);
        let yDomain = [0, D3.max(this.data, d => d.y)];
        let yDomainRight = [0, D3.max(this.data, d => d.y+100)];
        // create scales
        //this.xScale = D3.scaleTime().domain(xDomain).rangeRound([0, this.width]);

        this.xScale = D3.scaleTime().domain([new Date(this.data[0].x), new Date(this.data[this.data.length - 1].x)])
            .range([0, this.width-this.margin.right-10]);


        this.yScale = D3.scaleLinear().domain(yDomain).range([this.height, 0]);

        this.yScaleRight = D3.scaleLinear().domain(yDomainRight).range([this.height, 0]);
        //this.yAxisRight = D3.axisRight(this.yScale).ticks(5);

        this.yAxisRight = svg.append('g')
            .attr('class', 'axis axis-y-right')
            .attr('transform', `translate(${this.width - this.margin.right  }, ${ this.margin.top})`)
            .call(D3.axisRight(this.yScaleRight));


        // bar colors
        this.colors = D3.scaleLinear().domain([0, this.data.length]).range(<any[]>['red', 'blue']);

        // x & y axis
        this.xAxis = svg.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(D3.axisBottom(this.xScale).ticks(D3.timeDay, 1)
                .tickFormat(D3.timeFormat("%m-%y")) );

        this.yAxis = svg.append('g')
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(D3.axisLeft(this.yScale));


    }

    updateChart() {
        // update scales & axis
        //this.xScale.domain(this.data.map(d => d.x));
        this.xScale = D3.scaleTime().range([0, this.width - this.margin.right - this.margin.left]).domain([new Date(this.data[0].x), new Date(this.data[this.data.length - 1].x)]);

        this.yScale.domain([0, D3.max(this.data, d => d.y)]);
        this.colors.domain([0, this.data.length]);
       // this.xAxis.transition().call(D3.axisBottom(this.xScale));
        this.xAxis
            .call(D3.axisBottom(this.xScale)
                .ticks(D3.timeMonth, 3)
                .tickSize(10)
                .tickFormat(D3.timeFormat("%m-%y"))

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

        var line = D3.line()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y));

        /*this.chart.append("path")
            .datum(this.data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
         */

        this.yAxisRight.call(D3.axisRight(this.yScaleRight));
        var line1 = D3.line()
            .x(d => this.xScale(d.x))
            .y((d, i) => (this.yScaleRight(parseInt(d.y) + i*2)));

        this.chart.append("path")
            .datum(this.data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line1);



        // update existing bars
        this.chart.selectAll('.bar').transition()
            .attr('x', d => {
                this.xScale(new Date(d.x));
                    console.log(d.x);
            })
            .attr('y', d => this.yScale(d.y))
            .attr('width', d => 5)//this.width / this.data.length - this.barPadding)
            .attr('height', d => this.height - this.yScale(d.y))
            .style('fill', (d, i) => this.colors(i));



        // add new bars
        update
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => this.xScale(new Date(d.x)))
            .attr('y', d => this.yScale(0))
            .attr('width', 5)//this.width / this.data.length - this.barPadding)
            .attr('height', 0)
            .style('fill', (d, i) => this.colors(i))
            .transition()
            .delay((d, i) => i * 10)
            .attr('y', d => this.yScale(d.y))
            .attr('height', d => this.height - this.yScale(d.y));

        // draw dots
        this.chart.selectAll(".dot")
            .data(this.data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", d => this.xScale(new Date(d.x)) )
            .attr("cy", (d, i) =>  (this.yScaleRight(parseInt(d.y) + i*2)))
            .style("fill", "#000");

        // draw dots
        this.chart.selectAll(".dot1")
            .data(this.data)
            .enter().append("circle")
            .attr("class", "dot1")
            .attr("r", 4)
            .attr("cx", d => this.xScale(new Date(d.x)) )
            .attr("cy", d => this.height)
            .style("fill", "#000");
    }
}






/*{

    @Input() config: Array<AreaChartConfig>;

    private host;
    private svg;
    private margin;
    private width;
    private height;
    private xScale;
    private yScale;
    private xAxis;
    private yAxis;
    private htmlElement: HTMLElement;
    /**
     * We request angular for the element reference
     * and then we create a D3 Wrapper for our host element
     *
    constructor(private element: ElementRef) {
        this.htmlElement = this.element.nativeElement;
        console.log(D3);
        this.host = D3.select(this.element.nativeElement);
    }
    /**
     * Everythime the @Input is updated, we rebuild the chart
     **
    ngOnChanges(): void {
        if (!this.config || this.config.length === 0) return;
        this.setup();
        this.buildSVG();
        this.populate();
        this.drawXAxis();
        this.drawYAxis();
    }
    /**
     * Basically we get the dom element size and build the container configs
     * also we create the xScale and yScale ranges depending on calculations
     **
    private setup(): void {
        this.margin = { top: 20, right: 20, bottom: 40, left: 40 };
        this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
        this.height = this.width * 0.5 - this.margin.top - this.margin.bottom;
        this.xScale = D3.scaleTime().range([0, this.width]);
        this.yScale = D3.scaleLinear().range([this.height, 0]);
    }
    /**
     * We can now build our SVG element using the configurations we created
     **
    private buildSVG(): void {
        this.host.html('');
        this.svg = this.host.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }
    /**
     * Method to create the X Axis, will use Month as tick date format
     * Also assing some classes for CSS Stylimg
     **
    private drawXAxis(): void {
        this.xAxis = D3.axisBottom().scale(this.xScale)
            .tickFormat(t => Moment(t).format('MMM').toUpperCase())
            .tickPadding(15);
        this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(this.xAxis);
    }
    /**
     * Method to create the Y Axis, will use numeric values as tick date format
     * Also assing some classes for CSS Stylimg and rotating the axis vertically
     **
    private drawYAxis(): void {
        this.yAxis = D3.axisLeft().scale(this.yScale)
            //.orient('left')
            .tickPadding(10);
        this.svg.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)');
    }
    /**
     * Will return the maximum value in any dataset inserted, so we use
     * it later for the maximum number in the Y Axis
     **
    private getMaxY(): number {
        let maxValuesOfAreas = [];
        maxValuesOfAreas.push(1);
        return Math.max(...maxValuesOfAreas);
    }
    /**
     * Now we populate using our dataset, mapping the x and y values
     * into the x and y domains, also we set the interpolation so we decide
     * how the Area Chart is plotted.
     **
    private populate(): void {
        this.config.forEach((area: any) => {
            console.log(area);
            this.xScale.domain(D3.extent(area.dataset, (d: any) => d.date));
            this.yScale.domain([0, this.getMaxY()]);
            this.svg.append('path')
                .datum(area.dataset)
                .attr('class', 'area')
                .style('fill', area.settings.fill)
                .attr('d', D3.area()
                    .x((d: any) => this.xScale(d.date))
                    .y0(this.height)
                    .y1((d: any) => this.yScale(d.count))
                    //.curve(area.settings.interpolation)
            );
        });
    }
}*/