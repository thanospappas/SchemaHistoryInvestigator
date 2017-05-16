/**
 * Created by thanosp on 21/4/2017.
 */

/**
 * Created by thanosp on 17/4/2017.
 */
import {Component, OnInit, OnChanges, SimpleChanges}  from '@angular/core';
import * as $ from 'jquery';

@Component({
    selector: 'summary-section',
    templateUrl: './summary.html',

})


export class SummarySection implements OnInit, OnChanges {

    editor;

    ngOnInit() {

            let x = $(".loader-container").css("display","none");


    }


    ngOnChanges(changes: SimpleChanges): void {
    }


}
