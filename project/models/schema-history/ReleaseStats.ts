/**
 * Created by thanosp on 11/4/2017.
 */

export class Stats{
    private tableInsertions:number;
    private tableDeletions:number;
    private attributeInsertionsAtExistingTables:number;
    private attributeDeletionsAtExistingTables:number;
    private attributeTypeAlternations:number;
    private keyAlternations:number;
    private attributesInsertedAtNewTables:number;
    private attributesDeletedAtDeletedTables:number;

    private averageSchemaSizeTables:number;
    private averageSchemaSizeAttributes:number;

    private tablesAtStart:number;
    private tablesAtEnd:number;
    private attributesAtStart:number;
    private attributesAtEnd:number;

    private attributesUpdates:number;

    constructor(){
        this.tableInsertions = this.tableDeletions
        = this.attributeInsertionsAtExistingTables = this.attributeDeletionsAtExistingTables
        = this.attributeTypeAlternations = this.keyAlternations = this.attributesInsertedAtNewTables
        = this.attributesDeletedAtDeletedTables = this.averageSchemaSizeAttributes
        = this.averageSchemaSizeTables = 0;

        this.tablesAtStart = this.tablesAtEnd =
            this.attributesAtStart = this.attributesAtEnd = -1;
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
        return this.averageSchemaSizeTables;
    }

    public setSchemaSizeTable(schemaSize:number){
        this.averageSchemaSizeTables = schemaSize;
    }

    public getSchemaSizeAttribute(){
        return this.averageSchemaSizeAttributes;
    }

    public setSchemaSizeAttribute(schemaSize:number){
        this.averageSchemaSizeAttributes = schemaSize;
    }

    public computeAttributeUpdates(){
        this.attributesUpdates = this.getKeyAlternations() + this.getAttributeTypeAlternations() +
                this.getAttributeInsertionsAtExistingTables() + this.getAttributeDeletionsAtExistingTables();
    }

    public getAttributesUpdates(){
        return this.attributesUpdates;
    }

    public setTablesAtStart(tables:number){
        this.tablesAtStart = tables;
    }

    public getTablesAtStart(){
        return this.tablesAtStart;
    }

    public setAttributesAtStart(attributes:number){
        this.attributesAtStart = attributes;
    }

    public getAttributesAtStart(){
        return this.attributesAtStart;
    }

    public setTablesAtEnd(tables:number){
        this.tablesAtEnd = tables;
    }

    public getTablesAtEnd(){
        return this.tablesAtEnd;
    }

    public setAttributesAtEnd(attributes:number){
        this.attributesAtEnd = attributes;
    }

    public getAttributesAtEnd(){
        return this.attributesAtEnd;
    }


}
