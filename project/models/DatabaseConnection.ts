/**
 * Created by thanosp on 17/4/2017.
 */

export class DatabaseConnection{
    public DB;

    public databaseConnections: Array<Connection>;

    constructor() {
        this.databaseConnections = new Array<Connection>();
        let path = require("path");
        let sqlite3 = require('sqlite3').verbose();
        let file = path.join(__dirname, './database/master_database.db') ;
        this.DB = new sqlite3.Database(file);
        this.DB.all("SELECT * FROM Projects", (err, projects) => {
            //this.databaseConnections = projects;
            for(let project of projects){
                let dbConnection:Connection = { name: '', id:-1, connection:''};
                dbConnection.name = project.P_DB_PATH;
                dbConnection.id = project.P_ID;
                this.databaseConnections.push(dbConnection);

            }
            this.attachDatabases();
        });
    }

    attachDatabases(){
        for(let dbConnection of this.databaseConnections){
            let path = require("path");
            let sqlite3 = require('sqlite3').verbose();
            let file = path.join(__dirname, './database/' + dbConnection.name);
            dbConnection.connection = new sqlite3.Database(file);
            /*dbConnection.connection.all("SELECT COUNT(*) FROM Commits;", (err, res) => {
                console.log(res);
            });*/
        }

    }

    getDBConnection(projectId){
        let index = this.databaseConnections.findIndex((p) => p.id == projectId);
        return this.databaseConnections[index].connection;
    }


}

export interface Connection{
    name: string;
    id: number;
    connection:any;
}