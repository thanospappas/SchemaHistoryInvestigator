/**
 * Created by thanosp on 3/6/2017.
 */


export class CommitClassifier{
    private releases:Array<CommitClassificationInformation>;
    private intraChangesLow:number;
    private intraChangesMedium:number;

    private birthsDeathsLow:number;
    private birthsDeathsMedium:number;

    private inputFiles:Array<string> = [
        'biosql_transitions.csv', 'ensembl_transitions.csv',
        'mediawiki_transitions.csv', 'opencart_transitions.csv',
        'phpbb_transitions.csv', 'typo_transitions.csv'
    ];
    private outputFiles:Array<string> =[
        'biosql_commits_classified.csv', 'ensembl_commits_classified.csv',
        'mediawiki_commits_classified.csv', 'opencart_commits_classified.csv',
        'phpbb_commits_classified.csv', 'typo_commits_classified.csv'
    ];

    private outputStatsFiles:Array<string> =[
        'biosql_commits_classified_stats.csv', 'ensembl_commits_classified_stats.csv',
        'mediawiki_commits_classified_stats.csv', 'opencart_commits_stats.csv',
        'phpbb_commits_classified_stats.csv', 'typo_commits_classified_stats.csv'
    ];

    constructor(){
        this.releases = new Array<CommitClassificationInformation>();
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

        let lowLimit = Math.floor(intraTableUpdates.length*0.8);
        let mediumLimit = Math.floor(intraTableUpdates.length*0.95);
        this.intraChangesLow = intraTableUpdates[lowLimit];
        this.intraChangesMedium = intraTableUpdates[mediumLimit];

        this.birthsDeathsLow = birthsDeathsTotal[lowLimit];
        this.birthsDeathsMedium = birthsDeathsTotal[mediumLimit];

        if(this.intraChangesLow == this.intraChangesMedium){
            let largerThanLowLimit = intraTableUpdates.filter((num) => { return num > this.intraChangesLow});
            largerThanLowLimit.sort((a,b) => {return a-b});
            //console.log(largerThanLowLimit);
            this.birthsDeathsMedium = largerThanLowLimit[0];
        }
        if(this.birthsDeathsLow == this.birthsDeathsMedium){
            let largerThanLowLimit = intraTableUpdates.filter((num) => { return num > this.birthsDeathsLow});
            //console.log(largerThanLowLimit);
            this.birthsDeathsMedium = largerThanLowLimit[0];
        }
    }

    classifyReleases(/*i*/){
        let threshold = 0.3;
        for(let release of this.releases){
            let labels:Array<string> = new Array<string>();
            let summarizedLabels :Array<string> = [];

            //let hasTableActivity = false;

            if(release.tableBirths == 0 && release.tableDeaths == 0){
                if (release.attrsEjected == 0 && release.attrsInjected == 0
                    && release.attrsTypeUpdated == 0 && release.attrsKeyUpdated == 0){
                    labels.push("Zero Logical Change");
                    summarizedLabels.push("Zero Logical Change");
                }
            }
            else if(release.tableBirths +  release.tableDeaths > 0){
                //hasTableActivity = true;
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
                    label += "Maintenance: table restructuring";
                    labels.push(label);
                }
                else if (birthPercent > deathPercent + threshold){
                    //table expansion - restructuring
                    label += "Growth: table expansion";
                    labels.push(label);
                }
                else if(deathPercent > birthPercent + threshold){
                    //table shrinking - restructuring
                    label += "Maintenance: table shrinking";
                    labels.push(label);
                }
                else{
                    //maintenance
                    label += "Maintenance: table restructuring";
                    labels.push(label);
                }
                summarizedLabels.push(label);
            }

            if(release.attrsEjected + release.attrsInjected > 0){
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

                if( (ejectedPercent + threshold) < injectedPercent){
                    //growth: inter table expansion
                    label += "Growth: intra table expansion";
                    labels.push(label);
                }
                else if(ejectedPercent > ( injectedPercent + threshold)){
                    //maintenance: inter table shrink
                    label += "Maintenance: intra table shrinking";
                    labels.push(label);
                }
                else{// intra table maintenance
                    label += "Maintenance: intra table restructuring";
                    labels.push(label);
                }


                if(!isLow){
                    summarizedLabels.push(label);
                }
            }

            let updateSum = release.attrsTypeUpdated + release.attrsKeyUpdated;
            let label = "";
            let isUpdLow = false;
            if(updateSum <= this.intraChangesLow){
                label += "Low ";
                isUpdLow = true;
            }
            else if(updateSum <= this.intraChangesMedium){
                label += "Medium ";
            }
            else{
                label += "High ";
            }

            if(updateSum > 0){
                // maintenance
                label += "Intra table amendment";
                labels.push(label);
                if(!isUpdLow){
                    summarizedLabels.push(label)
                }
            }

            release.labels = labels;
            if(summarizedLabels.length == 0){
                summarizedLabels.push("Low intra table activity");
                release.summarizedLabels = summarizedLabels;
            }
            else{
                release.summarizedLabels = summarizedLabels;
            }


        }
        //this.export(i);
        //this.exportStats(i);

    }

    export(i){
        let fs = require("fs");
        //console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i]);
        let outFile = 'C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i];
        if(fs.existsSync(outFile))
            fs.truncateSync(outFile);

        fs.appendFileSync(outFile,
            "CommitDate;Name;Births;Deaths;aIns@eT;aDel@eT;keyAlt;TypeAlt;Schema Growth;Categories;SummarizedCategories" + "\n");
        for(let release of this.releases){
            fs.appendFileSync(outFile,
                release.date + ";" + release.releaseName + ";" +release.tableBirths + ";" + release.tableDeaths + ";" +
                release.attrsInjected + ";" + release.attrsEjected + ";" + release.attrsKeyUpdated
                + ";" + release.attrsTypeUpdated + ";" + release.growth + ";" + release.labels.toString() + ";"
                + release.summarizedLabels.toString() +"\n");
        }
        //fs.close(fd);


    }

    exportStats(i){
        let fs = require("fs");
        //console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i]);
        let outFile = 'C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i];
        if(fs.existsSync(outFile))
            fs.truncateSync(outFile);

        let categoriesCounts = [];
        let summarizedCategoriesCounts = [];
        for(let release of this.releases){


            for(let label of release.labels){
                let index = categoriesCounts.findIndex((c) => c.name == label);
                if (index != -1){
                    categoriesCounts[index].count++;
                }
                else{
                    let cat = { name: '', count: 0};
                    cat.name = label;
                    cat.count = 1;
                    categoriesCounts.push(cat);
                }
            }
            for(let label of release.summarizedLabels){
                let index = summarizedCategoriesCounts.findIndex((c) => c.name == label);
                if (index != -1){
                    summarizedCategoriesCounts[index].count++;
                }
                else{
                    let cat = { name: '', count: 0};
                    cat.name = label;
                    cat.count = 1;
                    summarizedCategoriesCounts.push(cat);
                }
            }


        }
        fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
            "Category;Count"  +"\n");
        for(let cat of categoriesCounts){
            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
                cat.name + ";" + cat.count  +"\n");
        }
        fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
            "\nSummarized Category;Count"  +"\n");
        for(let cat of summarizedCategoriesCounts){
            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
                cat.name + ";" + cat.count  +"\n");
        }

        //this.findPatterns(i);

        //fs.close(fd);
    }

    readCommits(){
        // Synchronous read
        var fs = require("fs");
        for(let i = 0; i < this.inputFiles.length;i++){
            this.releases = new Array<CommitClassificationInformation>();
            //console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.inputFiles[i]);
            var data = fs.readFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.inputFiles[i]);
            for(let line of data.toString().split("\n")){
                if(line.indexOf("trID") !== -1) continue;
                let splittedLine = line.split(";");
                if(splittedLine.length < 2) continue;
                let releaseInfo:CommitClassificationInformation = {
                    releaseName: '',attrsInjected:-1, attrsEjected:-1, attrsTypeUpdated:-1,
                    attrsKeyUpdated:-1, tableBirths:-1, tableDeaths:-1, growth:-1
                };

                releaseInfo.releaseName = splittedLine[16];
                releaseInfo.tableBirths = parseInt(splittedLine[8]);
                releaseInfo.tableDeaths = parseInt(splittedLine[9]);
                releaseInfo.attrsInjected = parseInt(splittedLine[10]);
                releaseInfo.attrsEjected = parseInt(splittedLine[11]);
                releaseInfo.attrsKeyUpdated = parseInt(splittedLine[13]);
                releaseInfo.attrsTypeUpdated = parseInt(splittedLine[12]);
                releaseInfo.growth = parseInt(splittedLine[5]) - parseInt(splittedLine[4]);

                releaseInfo.date = splittedLine[0];
                this.releases.push(releaseInfo);
            }

            this.computeThresholds();
            //this.classifyReleases(i);
            //this.classifyReleases();
            //this.export(i);
            //this.exportStats(i);
        }

    }

    getClassifiedCommits(){
        return this.releases;
    }

    setCommitsForClassification(commits){

        for(let commit of commits){
            let releaseInfo:CommitClassificationInformation = {
                releaseName: '',attrsInjected:-1, attrsEjected:-1, attrsTypeUpdated:-1,
                attrsKeyUpdated:-1, tableBirths:-1, tableDeaths:-1, growth:-1
            };

            //releaseInfo.releaseName = splittedLine[16];
            releaseInfo.tableBirths = commit.tableBirths;
            releaseInfo.tableDeaths = commit.tableDeaths;
            releaseInfo.attrsInjected = commit.attributesInsertedAtSurvivingTables;
            releaseInfo.attrsEjected = commit.attributesDeletedAtSurvivingTables;
            releaseInfo.attrsKeyUpdated = commit.typeChanges;
            releaseInfo.attrsTypeUpdated = commit.keyChanges;
            releaseInfo.growth = commit.schemaGrowth;

            releaseInfo.date = commit.commitDate;
            this.releases.push(releaseInfo);
        }

    }

}

export interface CommitClassificationInformation{
    releaseName:string;
    attrsInjected:number;
    attrsEjected:number;
    attrsTypeUpdated:number;
    attrsKeyUpdated:number;
    tableBirths:number;
    tableDeaths:number;
    growth:number;
    labels?:Array<string>;
    summarizedLabels?:Array<string>;
    date?:string;
}