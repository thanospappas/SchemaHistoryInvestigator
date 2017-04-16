/**
 * Created by thanosp on 12/4/2017.
 */
import { Component , OnInit} from '@angular/core';
import {AreaChartConfig} from '../charts/change-breakdown.config';
import {AreaChart} from "../charts/change-breakdown.component";
@Component({
    selector: 'history-app',
    templateUrl: './history1.html'

})
export class HistoryComponent  implements OnInit{
    description = 'Here goes the history chart....';
    //private areaChartConfig: Array<AreaChartConfig>;
    private stats: Array<any>;

    ngOnInit(){
        // Get JSON Object from Response
        this.stats = [
            { "date": "2016-04-14T21:18:26.838Z", "count": 0 },
            { "date": "2016-04-15T21:18:26.838Z","count": 0 },
            { "date": "2016-04-16T21:18:26.838Z", "count": 0 },
            { "date": "2016-04-17T21:18:26.838Z",  "count": 0 },
            { "date": "2016-04-18T21:18:26.838Z", "count": 0 },
            { "date": "2016-04-19T21:18:26.838Z", "count": 0 },
            { "date": "2016-04-20T21:18:26.838Z", "count": 0 },
            { "date": "2016-04-21T21:18:26.838Z",   "count": 1 } ];
    }
    constructor(){


    }

}
