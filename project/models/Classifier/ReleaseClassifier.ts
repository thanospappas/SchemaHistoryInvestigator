import {ArgumentOutOfRangeError} from "rxjs";
/**
 * Created by thanosp on 31/5/2017.
 */

export class ReleaseClassifier{

    private releases:Array<ReleaseInformation>;
    private intraChangesLow:number;
    private intraChangesMedium:number;

    private birthsDeathsLow:number;
    private birthsDeathsMedium:number;

    private inputFiles:Array<string> = [
        'biosql_releases.csv', 'ensembl_releases.csv',
        'mediawiki_releases.csv', 'opencart_releases.csv',
        'phpbb_releases.csv', 'typo_releases.csv'
            ];
    private outputFiles:Array<string> =[
        'biosql_releases_classified.csv', 'ensembl_releases_classified.csv',
        'mediawiki_releases_classified.csv', 'opencart_releases_classified.csv',
        'phpbb_releases_classified.csv', 'typo_releases_classified.csv'
        ];

    constructor(){
        this.releases = new Array<ReleaseInformation>();
        //this.outputFiles = new Array<string>();

    }

    computeThresholds(){
        let intraTableUpdates:Array<number> = [];
        let birthsDeathsTotal:Array<number> = [];

        for(let release of this.releases){
            let totalIntra:number = release.attrsInjected + release.attrsEjected + release.attrsKeyUpdated + release.attrsTypeUpdated;
            let totalBirthsDeaths:number = release. tableBirths + release.tableDeaths;
            intraTableUpdates.push(totalIntra);
            birthsDeathsTotal.push(totalBirthsDeaths);
        }
        intraTableUpdates.sort((a, b) => {return a-b});
        birthsDeathsTotal.sort((a, b) => {return a-b});

        let lowLimit = Math.floor(intraTableUpdates.length*0.6);
        let mediumLimit = Math.floor(intraTableUpdates.length*0.9);
        this.intraChangesLow = intraTableUpdates[lowLimit];
        this.intraChangesMedium = intraTableUpdates[mediumLimit];

        console.log(this.intraChangesLow);
        console.log(this.intraChangesMedium);

        this.birthsDeathsLow = birthsDeathsTotal[lowLimit];
        this.birthsDeathsMedium = birthsDeathsTotal[mediumLimit];

        if(this.intraChangesLow == this.intraChangesMedium){
            let largerThanLowLimit = intraTableUpdates.filter((num) => { return num > this.intraChangesLow});
            console.log(largerThanLowLimit);
            this.birthsDeathsMedium[0] = largerThanLowLimit[0];
        }
        if(this.birthsDeathsLow == this.birthsDeathsMedium){
            let largerThanLowLimit = intraTableUpdates.filter((num) => { return num > this.birthsDeathsLow});
            console.log(largerThanLowLimit);
            this.birthsDeathsMedium[0] = largerThanLowLimit[0];
        }
    }

    classifyReleases(i){
        let threshold = 0.35;
        for(let release of this.releases){
            let labels:Array<string> = new Array<string>();
            let summarizedLabels :Array<string> = [];
            if(release.tableBirths == 0 && release.tableDeaths == 0){

                let sum = release.attrsEjected + release.attrsInjected;
                let ejectedPercent = release.attrsEjected / (1.0*sum);
                let injectedPercent = release.attrsInjected / (1.0*sum);
                let label = "";
                let isLow:boolean = false;
                if(sum <= this.intraChangesLow){
                    label += "Low ";
                    isLow = true;
                }
                else if(sum <= this.intraChangesMedium){
                    label += "Medium ";
                }
                else{
                    label += "High ";
                }
                let isZero = false;
                if (release.attrsEjected == 0 && release.attrsInjected == 0
                    && release.attrsTypeUpdated == 0 && release.attrsKeyUpdated == 0){
                    labels.push("Zero Logical Change");
                    isZero = true;
                }
                else if(release.attrsEjected == 0 && release.attrsInjected == 0){
                    // do not add labels
                }
                else if( (ejectedPercent + threshold) < injectedPercent){
                    //growth: inter table expansion
                    label += "Growth: intra table expansion";
                    labels.push(label);
                }
                else if(ejectedPercent > ( injectedPercent + threshold)){
                    //maintenance: inter table shrink
                    label += "Maintenance: intra table shrink";
                    labels.push(label);
                }
                else{// inter table maintenance
                    label += "Intra table maintenance";
                    labels.push(label);
                }

                if(isZero){
                    summarizedLabels.push("Zero Logical Change");
                }
                else if(!isLow){
                    summarizedLabels.push(label);
                }
                else{
                    summarizedLabels.push("Low intra table activity");
                }
            }
            else if(release.tableBirths == 0 && release.tableDeaths > 0){
                //table shrink, maintenance
                let label = "";
                if(release.tableDeaths <= this.birthsDeathsLow){
                    label += "Low ";
                }
                else if(release.tableDeaths <= this.birthsDeathsMedium){
                    label += "Medium ";
                }
                else{
                    label += "High ";
                }
                label += "Maintenance: table shrink";
                labels.push(label);
            }
            else if(release.tableBirths > 0 && release.tableDeaths == 0){
                //table expansion
                let label = "";
                if(release.tableBirths <= this.birthsDeathsLow){
                    label += "Low ";
                }
                else if(release.tableBirths <= this.birthsDeathsMedium){
                    label += "Medium ";
                }
                else{
                    label += "High ";
                }
                label += "Table expansion";
                labels.push(label);
            }
            else if(release.tableBirths > 0 && release.tableDeaths > 0){
                let tableSum = release.tableBirths + release.tableDeaths;

                let birthPercent = release.tableBirths/(1.0*tableSum);
                let deathPercent = release.tableDeaths/(1.0*tableSum);

                let label = "";
                if((release.tableBirths + release.tableDeaths) <= this.birthsDeathsLow){
                    label += "Low ";
                }
                else if(release.tableBirths <= this.birthsDeathsMedium){
                    label += "Medium ";
                }
                else{
                    label += "High ";
                }

                if(release.growth == 0){
                    //maintenance/restructuring
                    label += "Maintenance: restructuring";
                    labels.push(label);
                }
                else if (birthPercent > deathPercent + threshold){
                        //table expansion - restructuring
                        label += "Table expansion";
                        labels.push(label);
                }
                else if(deathPercent > birthPercent + threshold){
                    //table shrinking - restructuring
                    label += "Table shrinking";
                    labels.push(label);
                }
                else{
                    //maintenance
                    label += "Maintenance: Restructuring";
                    labels.push(label);
                }
            }


            let updateSum = release.attrsTypeUpdated + release.attrsKeyUpdated;
            let label = "";
            if(updateSum <= this.intraChangesLow){
                label += "Low ";
            }
            else if(updateSum <= this.intraChangesMedium){
                label += "Medium ";
            }
            else{
                label += "High ";
            }
            console.log(updateSum);
            if(updateSum > 0){
                //perfective maintenance
                label += "Maintenace";
                labels.push(label);
            }

            release.labels = labels;

        }
        this.export(i);

    }

    export(i){
        let fs = require("fs");
        console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i]);
        fs.truncateSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i]);

            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i],
                "Name;Births;Deaths;aIns@eT;aDel@eT;keyAlt;TypeAlt;Schema Growth;Categories" + "\n");
            for(let release of this.releases){
                fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i],
                    release.releaseName + ";" +release.tableBirths + ";" + release.tableDeaths + ";" +
                    release.attrsInjected + ";" + release.attrsEjected + ";" + release.attrsKeyUpdated
                    + ";" + release.attrsTypeUpdated + ";" + release.growth + ";" + release.labels.toString()+"\n");
            }
            //fs.close(fd);


    }


    readReleases(){
        // Synchronous read
        var fs = require("fs");
        for(let i = 0; i < this.inputFiles.length;i++){
            this.releases = new Array<ReleaseInformation>();
            console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.inputFiles[i]);
            var data = fs.readFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.inputFiles[i]);
            for(let line of data.toString().split("\n")){
                if(line.indexOf("Phase") !== -1) continue;
                let splittedLine = line.split(";");
                if(splittedLine.length < 2) continue;
                let releaseInfo:ReleaseInformation = {
                    releaseName: '',attrsInjected:-1, attrsEjected:-1, attrsTypeUpdated:-1,
                    attrsKeyUpdated:-1, tableBirths:-1, tableDeaths:-1, growth:-1
                };

                releaseInfo.releaseName = splittedLine[0];
                releaseInfo.tableBirths = parseInt(splittedLine[2]);
                releaseInfo.tableDeaths = parseInt(splittedLine[3]);
                releaseInfo.attrsInjected = parseInt(splittedLine[4]);
                releaseInfo.attrsEjected = parseInt(splittedLine[7]);
                releaseInfo.attrsKeyUpdated = parseInt(splittedLine[8]);
                releaseInfo.attrsTypeUpdated = parseInt(splittedLine[9]);
                releaseInfo.growth = parseInt(splittedLine[25]);
                this.releases.push(releaseInfo);
            }
            this.computeThresholds();
            this.classifyReleases(i);
        }

    }

}

export interface ReleaseInformation{
    releaseName:string;
    attrsInjected:number;
    attrsEjected:number;
    attrsTypeUpdated:number;
    attrsKeyUpdated:number;
    tableBirths:number;
    tableDeaths:number;
    growth:number;
    labels?:Array<string>;
}