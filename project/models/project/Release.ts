/**
 * Created by thanosp on 11/4/2017.
 */

import {Commit} from "./Commit";
import {Transition} from "../schema-history/Transition";
import {ReleaseStats} from "../schema-history/ReleaseStats";

export class Release{
    releaseMetrics:ReleaseStats;
    name:string;
    startDate:Date;
    startDateHuman:Date;
    duration:number;
    commitDuration:number;
    commitNumber:number;
    commitGap:number;
    schemaGrowth:number;
    attrsInjectedEjected:number;
    attributeUpdates:number;
    oldestCommitDate:Date;
    newestCommitDate:Date;

    constructor(){
        this.releaseMetrics = new ReleaseStats();
    }



}
