import {AtomicSchemaChange} from "./AtomicSchemaChange";
/**
 * Created by thanosp on 11/5/2017.
 */

export class TableChange{

    private tableName:string;
    private changes:Array<AtomicSchemaChange>;

    public setTable(table:string){
        this.tableName = table;
    }

    public getTable():string{
        return this.tableName;
    }

    public getChanges():Array<AtomicSchemaChange>{
        return this.changes;
    }

    public setChanges(changes:Array<AtomicSchemaChange>){
        this.changes = changes;
    }

    public addChange(change:AtomicSchemaChange){
        this.changes.push(change);
    }

}