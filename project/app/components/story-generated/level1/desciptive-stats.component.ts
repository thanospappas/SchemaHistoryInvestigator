/**
 * Created by thanosp on 21/5/2017.
 */

import { Component, OnInit }  from '@angular/core';
import * as D3 from 'd3/build/d3.js';
import * as $ from 'jquery';
import {DescriptiveStatsService} from "../../../services/story-level1-service";


@Component({
    selector: 'descriptive-stats',
    templateUrl: './descriptive-stats.html'
})

export class DescriptiveStatsLevel implements OnInit {

    private selectedCharts;

    constructor (private descriptiveStatsService:DescriptiveStatsService) {}

    ngOnInit(){
        this.descriptiveStatsService.getSelectedCharts().subscribe(
            charts => {
                this.selectedCharts = charts;
                console.log("Calleeeeed");
                console.log(this.selectedCharts );

                for(let i = 0;i < this.selectedCharts.length; i++){
                    var newSvg = document.getElementById('release-summary-chart');
                    newSvg.outerHTML += this.selectedCharts[i];
                }

            });
    }

    /*ngOnInit() {
        setTimeout(function() {
            let svg = D3.select(".summary-chart svg");
            console.log(svg);
            console.log(svg._groups[0][0]);
            let s = new XMLSerializer();
            var XMLS = new XMLSerializer();
            var inp_xmls = XMLS.serializeToString(svg._groups[0][0]); // First convert DOM node into a string
            console.log(inp_xmls);
            var newSvg = document.getElementById('release-summary-chart');
            newSvg.outerHTML += inp_xmls;


        }, 3000);

    }*/

}