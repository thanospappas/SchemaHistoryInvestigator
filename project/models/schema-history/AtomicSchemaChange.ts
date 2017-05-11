/**
 * Created by thanosp on 11/5/2017.
 */

export class AtomicSchemaChange{

    private eventType:string;
    private attributeType:string;
    private attributeName:string;
    private primaryKey:string;
    private foreignKey:string;
    private isKey:string;

    public setEventType(evType:string){
        this.eventType = evType;
    }

    public getEventType():string{
     return this.eventType;
    }

    public setAttributeType(attrType:string){
        this.attributeType = attrType;
    }

    public getAttributeType():string{
        return this.attributeType;
    }

    public setAttributeName(attrName:string){
        this.attributeName = attrName;
    }

    public getAttributeName():string{
        return this.attributeName;
    }
    public setPrimaryKey(pKey:string){
        this.primaryKey = pKey;
    }

    public getPrimaryKey():string{
        return this.primaryKey;
    }
    public setForeignKey(fKey:string){
        this.foreignKey = fKey;
    }

    public getForeignKey():string{
        return this.foreignKey;
    }

    public setIskey(isKey:string){
        this.isKey = isKey;
    }

    public getIskey():string{
        return this.isKey;
    }
}