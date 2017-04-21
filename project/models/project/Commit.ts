import {Author} from "./Author";
import {ReleaseStats} from "../schema-history/ReleaseStats";
/**
 * Created by thanosp on 21/4/2017.
 */

export class Commit{

    private text:string;
    private date:Date;
    private author:Author;
    private stats:ReleaseStats;

    setText(text:string){
        this.text = text;
    }

    getText():string{
        return this.text;
    }

    getDate():Date{
        return this.date;
    }

    setDate(date:number){

    }

    getAuthor():Author{
        return this.author;
    }

    setAuthor(name:string , email:string){
        this.author = new Author();
        this.author.setName(name);
        this.author.setEmail(email);
    }

    setStats(stats:ReleaseStats){
        this.stats = stats;
    }

    getStats():ReleaseStats{
        return this.stats;
    }



}