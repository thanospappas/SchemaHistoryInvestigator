import {TransitionsStats} from "./TransitionsStats";
/**
 * Created by thanosp on 18/4/2017.
 */

export class Transition{

    private id:number;
    private metrics:TransitionsStats;
    private date:number;
    private humanDate:Date;

    private oldVersion:string;
    private newVersion:string;

    constructor(){
        this.metrics = new TransitionsStats();
    }

    getId(){
        return this.id;
    }

    setId(id:number){
        this.id = id;
    }

    getDate(){
        return this.date;
    }

    setDate(date:number){
        this.date = date;
    }

    getHumanDate(){
        return this.humanDate;
    }

    setHumanDate(date:number){

        //this.humanDate = date;
    }

    getOldVersion(){
        return this.oldVersion;
    }

    setOldVersion(oldVersion:string){
        this.oldVersion = oldVersion;
    }

    getNewVersion(){
        return this.newVersion;
    }

    setNewVersion(newVersion:string){
        this.newVersion = newVersion;
    }

    getMetrics(){
        return this.metrics;
    }

}