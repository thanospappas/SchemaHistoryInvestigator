/**
 * Created by thanosp on 23/5/2017.
 */

import { Injectable }     from '@angular/core';

import { ReplaySubject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HighlightsCharacterizationsService {


    private selectedCommits;
    selectedCommits$ = new ReplaySubject(1);

    private commitChart;
    commitChart$ = new ReplaySubject(1);

    private textSummary;
    textSummary$ = new ReplaySubject(1);

    private releaseDescriptions;
    releaseDescriptions$ = new ReplaySubject(1);

    constructor () {}

    addSelectedCommits(commits){
        this.selectedCommits = commits;
        this.selectedCommits$.next(this.selectedCommits);
    }

    getSelectedCommits(){
        return this.selectedCommits$;
    }

    addCommitChart(chart){
        this.commitChart = chart;
        this.commitChart$.next(this.commitChart);
    }

    getCommitChart(){
        return this.commitChart$;
    }

    addTextSummary(text){
        this.textSummary = text;
        this.textSummary$.next(this.textSummary);
    }

    getTextSummary(){
        return this.textSummary$;
    }

    addReleaseDescriptions(releaseDescriptions){
        this.releaseDescriptions = releaseDescriptions;
        this.releaseDescriptions$.next(this.releaseDescriptions);
    }

    getReleaseDescriptions(){
        return this.releaseDescriptions$;
    }
}