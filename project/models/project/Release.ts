/**
 * Created by thanosp on 11/4/2017.
 */

import {Stats} from "../schema-history/ReleaseStats";

export class Release{
    releaseID:number;
    stats:Stats;
    name:string;
    startDate:number;
    dateHuman:Date;
    duration:number;
    commitDuration:number;
    commitNumber:number;
    contributorNumber:number;
    commitGap:number;
    schemaGrowth:number;
    attrsInjectedEjected:number;
    attributeUpdates:number;
    oldestCommitDate:number;
    newestCommitDate:number;

    releaseSummary:string;

    constructor(){
        this.stats = new Stats();
    }

    public setReleaseStats(releaseM:Stats){
        this.stats = releaseM;
    }


}
