/**
 * Created by thanosp on 21/4/2017.
 */

/**
 * Created by thanosp on 17/4/2017.
 */
import {Component, OnInit, OnChanges, SimpleChanges}  from '@angular/core';
import * as $ from 'jquery';
import {HttpService} from "../../services/http.service";

@Component({
    selector: 'summary-section',
    templateUrl: './summary.html',

})


export class SummarySection implements OnInit, OnChanges {

    editor;

    constructor(private httpService:HttpService){}

    ngOnInit() {

        let x = $(".loader-container").css("display","none");

        const url = "http://localhost:3000/api/v1/projects/1/commits/58437";
        console.log(url);
        this.httpService.update(url,{"commitSummary": "oooooooooooooooooooooooooooooooooo"});

    }


    ngOnChanges(changes: SimpleChanges): void {
    }


}
