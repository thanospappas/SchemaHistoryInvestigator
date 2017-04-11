/**
 * Created by thanosp on 11/4/2017.
 */

export class ReleaseStats{
    private oldTables:number;
    private newTables:number;
    private oldAttributes:number;
    private newAttributes:number;
    private tableInsertions:number;
    private tableDeletions:number;
    private attributeInsertionsAtExistingTables:number;
    private attributeDeletionsAtExistingTables:number;
    private attributeTypeAlternations:number;
    private keyAlternations:number;
    private attributesInsertedAtNewTables:number;
    private attributesDeletedAtDeletedTables:number;
    private averageShemaSizeTables:number;
    private averageShemaSizeAttributes:number;

    constructor(){
        this.oldTables = this.newTables = this.oldAttributes
        = this.newAttributes = this.tableInsertions = this.tableDeletions
        = this.attributeInsertionsAtExistingTables = this.attributeDeletionsAtExistingTables
        = this.attributeTypeAlternations = this.keyAlternations = this.attributesInsertedAtNewTables
        = this.attributesDeletedAtDeletedTables = this.averageShemaSizeAttributes
        = this.averageShemaSizeTables = 0;
    }

    public getOldTables():number {
        return this.oldTables;
    }

    public setOldTables(oldTables:number) {
        this.oldTables = oldTables;
    }

    public getNewTables():number {
        return this.newTables;
    }

    public setNewTables(newTables:number) {
        this.newTables = newTables;
    }

    public getOldAttributes():number {
        return this.oldAttributes;
    }

    public setOldAttributes(oldAttributes:number) {
        this.oldAttributes = oldAttributes;
    }

    public getNewAttributes():number {
        return this.newAttributes;
    }

    public setNewAttributes(newAttributes:number) {
        this.newAttributes = newAttributes;
    }

    public getTableInsertions():number {
        return this.tableInsertions;
    }

    public setTableInsertions(tableInsertions:number) {
        this.tableInsertions = tableInsertions;
    }

    public getTableDeletions():number {
        return this.tableDeletions;
    }

    public setTableDeletions(tableDeletions:number) {
        this.tableDeletions = tableDeletions;
    }

    public getAttributeInsertionsAtExistingTables():number {
        return this.attributeInsertionsAtExistingTables;
    }

    public setAttributeInsertionsAtExistingTables(attributeInsertionsAtExistingTables:number) {
        this.attributeInsertionsAtExistingTables = attributeInsertionsAtExistingTables;
    }

    public getAttributeDeletionsAtExistingTables():number {
        return this.attributeDeletionsAtExistingTables;
    }

    public setAttributeDeletionsAtExistingTables(attributeDeletionsAtExistingTables:number) {
        this.attributeDeletionsAtExistingTables = attributeDeletionsAtExistingTables;
    }

    public getAttributeTypeAlternations():number {
        return this.attributeTypeAlternations;
    }

    public setAttributeTypeAlternations(attributeTypeAlternations:number) {
        this.attributeTypeAlternations = attributeTypeAlternations;
    }

    public getKeyAlternations():number {
        return this.keyAlternations;
    }

    public setKeyAlternations(keyAlternations:number) {
        this.keyAlternations = keyAlternations;
    }

    public getAttributesInsertedAtNewTables():number {
        return this.attributesInsertedAtNewTables;
    }

    public setAttributesInsertedAtNewTables(attributesInsertedAtNewTables:number) {
        this.attributesInsertedAtNewTables = attributesInsertedAtNewTables;
    }

    public getAttributesDeletedAtDeletedTables():number {
        return this.attributesDeletedAtDeletedTables;
    }

    public setAttributesDeletedAtDeletedTables(attributesDeletedAtDeletedTables:number) {
        this.attributesDeletedAtDeletedTables = attributesDeletedAtDeletedTables;
    }

    public getSchemaSizeTable():number{
        return this.averageShemaSizeTables;
    }

    public setSchemaSizeTable(schemaSize:number){
        this.averageShemaSizeTables = schemaSize;
    }

    public getSchemaSizeAttribute(){
        return this.averageShemaSizeAttributes;
    }

    public setSchemaSizeAttribute(schemaSize:number){
        this.averageShemaSizeAttributes = schemaSize;
    }
}
