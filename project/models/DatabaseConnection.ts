/**
 * Created by thanosp on 17/4/2017.
 */

export class DatabaseConnection{
    public DB;

    constructor() {

        var path = require("path");

        var sqlite3 = require('sqlite3').verbose();
        var file = path.join(__dirname, './database/schemaEvolutionDB_new.db') ;
        this.DB = new sqlite3.Database(file);


    }
}