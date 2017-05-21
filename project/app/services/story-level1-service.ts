/**
 * Created by thanosp on 21/5/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable, ReplaySubject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class DescriptiveStatsService {


    private selectedReleases;
    selectedReleases$ = new ReplaySubject(1);

    private selectedCharts = [];
    selectedCharts$ = new ReplaySubject(1);
    private textSummary;
    private selectedAuthors;
    private topCochangedFiles;



    constructor () {}

    setSelectedReleases(releases){
        this.selectedReleases = releases;
        this.selectedReleases$.next(this.selectedReleases);
    }

    getSelectedReleases(){
        return this.selectedReleases$;
    }

    addSelectedChart(chart){

        this.selectedCharts.push(chart);
        this.selectedCharts$.next(this.selectedCharts);
    }

    getSelectedCharts(){
        return this.selectedCharts$;
    }


}