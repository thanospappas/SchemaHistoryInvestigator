import {DatabaseConnection} from "./DatabaseConnection";
/**
 * Created by thanosp on 17/4/2017.
 */

export abstract class DatabaseController{

    database:DatabaseConnection;

    constructor(){
        this.database = new DatabaseConnection();
    }

    abstract getAllData(projectID:any):Promise<any>;
    abstract getSingle(projectID:any,id):Promise<any>;
}