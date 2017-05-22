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

    private changeBreakdownChart;
    changeBreakdownChart$ = new ReplaySubject(1);

    private textSummary;
    textSummary$ = new ReplaySubject(1);

    private selectedAuthors;
    selectedAuthors$ = new ReplaySubject(1);

    private developersChart;
    developersChart$ = new ReplaySubject(1);

    private topCochangedFiles;
    topCochangedFiles$ = new ReplaySubject(1);

    private commitNumChart;
    commitNumChart$ = new ReplaySubject(1);

    private durationsChart;
    durationsChart$ = new ReplaySubject(1);

    private tablesChart;
    tablesChart$ = new ReplaySubject(1);



    constructor () {}

    setSelectedReleases(releases){
        this.selectedReleases = releases;
        this.selectedReleases$.next(this.selectedReleases);
    }

    getSelectedReleases(){
        return this.selectedReleases$;
    }

    addChangeBreakdownChart(chart){
        this.changeBreakdownChart = chart;
        this.changeBreakdownChart$.next(this.changeBreakdownChart);
    }

    getChangeBreakdownChart(){
        return this.changeBreakdownChart$;
    }

    addTextSummary(text){
        this.textSummary = text;
        this.textSummary$.next(this.textSummary);
    }

    getTextSummary(){
        return this.textSummary$;
    }

    addSelectedAuthors(authors){
        this.selectedAuthors = authors;
        this.selectedAuthors$.next(this.selectedAuthors);
    }

    getSelectedAuthors(){
        return this.selectedAuthors$;
    }

    addDevelopersChart(chart){
        this.developersChart = chart;
        this.developersChart$.next(this.developersChart);
    }

    getDevelopersChart(){
        return this.developersChart$;
    }

    addCochangedFiles(chart){
        this.topCochangedFiles = chart;
        this.topCochangedFiles$.next(this.topCochangedFiles);
    }

    getCochangedFiles(){
        return this.topCochangedFiles$;
    }

    addCommitNumChart(chart){
        this.commitNumChart = chart;
        this.commitNumChart$.next(this.commitNumChart);
    }

    getCommitNumChart(){
        return this.commitNumChart$;
    }

    addDurationsChart(chart){
        this.durationsChart = chart;
        this.durationsChart$.next(this.durationsChart);
    }

    getDurationsChart(){
        return this.durationsChart$;
    }

    addTablesChart(chart){
        this.tablesChart= chart;
        this.tablesChart$.next(this.tablesChart);
    }

    getTablesChart(){
        return this.tablesChart$;
    }

}