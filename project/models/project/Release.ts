/**
 * Created by thanosp on 11/4/2017.
 */

import {ReleaseStats} from "../schema-history/ReleaseStats";

export class Release{
    releaseMetrics:ReleaseStats;
    name:string;
    startDate:number;
    startDateHuman:Date;
    duration:number;
    commitDuration:number;
    commitNumber:number;
    commitGap:number;
    schemaGrowth:number;
    attrsInjectedEjected:number;
    attributeUpdates:number;
    oldestCommitDate:number;
    newestCommitDate:number;

    constructor(){
        this.releaseMetrics = new ReleaseStats();
    }



}
