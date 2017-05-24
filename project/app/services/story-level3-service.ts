/**
 * Created by thanosp on 24/5/2017.
 */


import { Injectable }     from '@angular/core';
import { ReplaySubject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ExplanationsService {


    private textSummary;
    textSummary$ = new ReplaySubject(1);

    private reasonsOfCommit;
    reasonsOfCommit$ = new ReplaySubject(1);

    private usefulStats;
    usefulStats$ = new ReplaySubject(1);

    private tablesAffected;
    tablesAffected$ = new ReplaySubject(1);

    private issuesInfo;
    issuesInfo$ = new ReplaySubject(1);

    constructor () {}

    addReasonOfCommit(reason){
        this.reasonsOfCommit = reason;
        this.reasonsOfCommit$.next(this.reasonsOfCommit);
    }

    getReasonOfCommit(){
        return this.reasonsOfCommit$;
    }

    addUsefulStats(stats){
        this.usefulStats = stats;
        this.usefulStats$.next(this.usefulStats);
    }

    getUsefulStats(){
        return this.usefulStats$;
    }

    addTextSummary(text){
        this.textSummary = text;
        this.textSummary$.next(this.textSummary);
    }

    getTextSummary(){
        return this.textSummary$;
    }

    addTablesAffected(tables){
        this.tablesAffected = tables;
        this.tablesAffected$.next(this.tablesAffected);
    }

    getTablesAffected(){
        return this.tablesAffected$;
    }

    addIssuesInfo(issues){
        this.issuesInfo = issues;
        this.issuesInfo$.next(this.issuesInfo);
    }

    getIssuesInfo(){
        return this.issuesInfo$;
    }
}