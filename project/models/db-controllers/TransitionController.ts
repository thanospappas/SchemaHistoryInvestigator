import {DatabaseController} from "../DatabaseController";
import {Transition} from "../schema-history/Transition";
/**
 * Created by thanosp on 18/4/2017.
 */

export class TransitionController extends DatabaseController{

    constructor(){
        super();
    }

    private assignStatsValue(tr:Transition, type:string, value:number) {
        if (type==("tDel")) {
            tr.getMetrics().setDeaths(value);
        } else if (type==("tIns")) {
            tr.getMetrics().setBirths(value);
        } else if (type==("aDel")) {
            tr.getMetrics().setAttrsDelAtExistTable(value);
        } else if (type==("aIns")) {
            tr.getMetrics().setAttrInsAtExistTable(value);
        } else if (type==("aTabDel")) {
            tr.getMetrics().setAttrsDelAtDeath(value);
        } else if (type==("aTabIns")) {
            tr.getMetrics().setAttrsInsAtBirth(value);
        } else if (type==("aTypeAlt")) {
            tr.getMetrics().setTypeChanges(value);
        } else if (type==("keyAlt")) {
            tr.getMetrics().setKeyChanges(value);
        } else if (type==("newT")){
            tr.getMetrics().setNewTables(value);
        } else if (type==("newA")){
            tr.getMetrics().setNewAttributes(value);
        }
    }

    private createTransitions(rows):Array<Transition>{
        let transitions:Array<Transition> = new Array<Transition>();
        let i = 0;

        for(let row of rows){
            let tr:Transition = new Transition();
            for(let tra of transitions){
                if(tra.getDate() == row.TR_TIME){
                    tr = tra;
                }
            }

            if(i % 12 ==0){ //new transition
                let newTr:Transition = new Transition();
                newTr.setDate(row.TR_TIME);
                newTr.setHumanDate(row.TR_TIME);
                newTr.setNewVersion(row.TR_NEW_VERSION);
                newTr.setOldVersion(row.TR_OLD_VERSION);
                newTr.setId(row.TR_ID);
                this.assignStatsValue(newTr,row.ME_TYPE_OF_METRIC, row.ME_VALUE);

                transitions.push(newTr);
            }
            else{ //already seen transition with different metric
                this.assignStatsValue(tr,row.ME_TYPE_OF_METRIC, row.ME_VALUE);
            }
            i++;
        }

        return transitions;
    }

    getAllData(projectID):Promise<any> {

        let currentPointer = this;

        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Projects, Branches, Schema_Histories, Transitions,  Metrics " +
                "WHERE Projects.PRJ_ID = " + projectID + " AND Projects.PRJ_ID = Branches.BR_PRJ_ID AND Branches.BR_ID = Schema_Histories.SH_BR_ID" +
                " AND Transitions.TR_SH_ID = Schema_Histories.SH_ID AND Metrics.ME_TR_ID = Transitions.TR_ID " +
                "ORDER BY(TR_TRANSITION_ID) ASC", function (err, transitions) {

                resolve(currentPointer.createTransitions(transitions));
            });
        });

    }

    getSingle():Promise<any> {
        throw new Error('Method not implemented.');
    }

    getTransitionsFromRelease(projectID,releaseID){
        let currentPointer = this;
        return new Promise((resolve) => {
            this.database.DB.all("SELECT * FROM Phases WHERE BR_PRJ_ID = " + projectID + "  AND RE_ID = " + releaseID +
                " ORDER BY(TR_TRANSITION_ID) ASC", function (err, transitions) {
                resolve(currentPointer.createTransitions(transitions));
            });
        });

    }


}