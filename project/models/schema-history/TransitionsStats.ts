/**
 * Created by thanosp on 18/4/2017.
 */

export class TransitionsStats{

    private attrInsertionsAtExistTable:number;
    private attrDeletionsAtExistTable:number;

    private keyChanges:number;
    private typeChanges:number;

    private attrInsertionAtBirth:number;
    private attrDeletionAtDeath:number;

    private newAttributes:number;
    private oldAttributes:number;

    private newTables:number;
    private oldTables:number;

    private births:number;
    private deaths:number;

    setAttrInsAtExistTable(attrs:number){
        this.attrInsertionsAtExistTable = attrs;
    }

    getAttrsInsAtExistTable(){
        return this.attrInsertionsAtExistTable;
    }

    setAttrsDelAtExistTable(attrs:number){
        this.attrDeletionsAtExistTable = attrs;
    }

    getAttrsDelAtExistTable(){
        return this.attrDeletionsAtExistTable;
    }

    setKeyChanges(attrs:number){
        this.keyChanges = attrs;
    }

    getKeyChanges() {
        return this.keyChanges;
    }

    setTypeChanges(attrs:number){
        this.typeChanges = attrs;
    }

    getTypeChanges(){
        return this.typeChanges;
    }

    setAttrsInsAtBirth(attrs:number){
        this.attrInsertionAtBirth = attrs;
    }

    getAttrsInsAtBirth(){
        return this.attrInsertionsAtExistTable;
    }

    setAttrsDelAtDeath(attrs:number){
        this.attrDeletionAtDeath = attrs;
    }

    getAttrsDelAtDeath(){
        return this.attrDeletionsAtExistTable;
    }

    setNewAttributes(newAttrs:number){
        this.newAttributes = newAttrs;
    }

    getNewAttributes(){
        return this.newAttributes;
    }

    setOldAttributes(oldAttrs:number){
        this.oldAttributes = oldAttrs;
    }

    getOldAttributes(){
        return this.oldAttributes;
    }

    setNewTables(newTables:number){
        this.newTables = newTables;
    }

    getNewTables(){
        return this.newTables;
    }

    setOldTables(oldTables:number){
        this.oldTables = oldTables;
    }

    getOldTables(){
        return this.oldTables;
    }

    setBirths(births:number){
        this.births = births;
    }

    getBirths(){
        return this.births;
    }

    setDeaths(deaths:number){
        this.deaths = deaths;
    }

    getDeaths(){
        return this.deaths;
    }


}