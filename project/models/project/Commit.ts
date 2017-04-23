import {Author} from "./Author";
import {Stats} from "../schema-history/ReleaseStats";
/**
 * Created by thanosp on 21/4/2017.
 */

export class Commit{

    private text:string;
    private dateHuman:Date;
    private author:Author;
    stats:Stats;

    constructor(){
        this.stats = new Stats();
    }

    setText(text:string){
        this.text = text;
    }

    getText():string{
        return this.text;
    }

    getDate():Date{
        return this.dateHuman;
    }

    setDate(date:number){
        this.dateHuman = new Date(date*1000);
    }

    getAuthor():Author{
        return this.author;
    }

    setAuthor(name:string , email:string){
        this.author = new Author();
        this.author.setName(name);
        this.author.setEmail(email);
    }

    setStats(stats:Stats){
        this.stats = stats;
    }

    getStats():Stats{
        return this.stats;
    }



}