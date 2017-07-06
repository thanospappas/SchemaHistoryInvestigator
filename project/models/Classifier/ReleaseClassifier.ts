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

    private outputStatsFiles:Array<string> =[
        'biosql_releases_classified_stats.csv', 'ensembl_releases_classified_stats.csv',
        'mediawiki_releases_classified_stats.csv', 'opencart_releases_classified_stats.csv',
        'phpbb_releases_classified_stats.csv', 'typo_releases_classified_stats.csv'
    ];

    constructor(){
        this.releases = new Array<ReleaseInformation>();
        //this.outputFiles = new Array<string>();

    }

    addRelease(release:ReleaseInformation){
        this.releases.push(release);
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
        this.intraChangesLow = intraTableUpdates[lowLimit-1];
        this.intraChangesMedium = intraTableUpdates[mediumLimit-1];
        console.log(mediumLimit);
        console.log(this.intraChangesLow);
        console.log(this.intraChangesMedium);

        this.birthsDeathsLow = birthsDeathsTotal[lowLimit-1];
        this.birthsDeathsMedium = birthsDeathsTotal[mediumLimit-1];

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

    classifyNExport(i){
        this.classifyReleases();
        this.export(i);
        this.exportStats(i);
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
                    label += "Maintenance: intra table shrink";
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
                label += "Maintenance: intra table amendment";
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

    getReleases(){
        return this.releases;
    }

    export(i){
        let fs = require("fs");
        console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i]);
        let outFile = 'C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i];
        if(fs.existsSync(outFile))
            fs.truncateSync(outFile);

            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i],
                "Name;Births;Deaths;aIns@eT;aDel@eT;keyAlt;TypeAlt;Schema Growth;Categories;SummarizedCategories" + "\n");
            for(let release of this.releases){
                fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputFiles[i],
                    release.releaseName + ";" +release.tableBirths + ";" + release.tableDeaths + ";" +
                    release.attrsInjected + ";" + release.attrsEjected + ";" + release.attrsKeyUpdated
                    + ";" + release.attrsTypeUpdated + ";" + release.growth + ";" + release.labels.toString() + ";"
                    + release.summarizedLabels.toString() +"\n");
            }
            //fs.close(fd);
    }

    exportStats(i){
        let fs = require("fs");
        console.log('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i]);
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

        this.findPatterns(i);

        //fs.close(fd);
    }


    findPatterns(i){
        let fs = require("fs");
        let outFile = 'C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i];

        let N = 2;
        let grams = [];
        let summarizedGrams = [];
        for (let i =0; i < this.releases.length-N; i++){
            let labels = this.releases[i].labels;
            if(labels.length > 1){
                labels.sort();
                if(labels.length > 2){
                    for(let i=0;i<labels.length;i++){
                        for(let j=i+1;j<labels.length;j++){
                            grams.push("{" + labels[i] + "," + labels[j] + "}");
                        }
                    }
                }
                grams.push("{" + labels.toString() + "}");
            }

            let sLabels = this.releases[i].summarizedLabels;
            if(sLabels.length > 1){
                sLabels.sort();
                if(sLabels.length > 2){
                    for(let i=0;i<sLabels.length;i++){
                        for(let j=i+1;j<sLabels.length;j++){
                            grams.push("{" + sLabels[i] + "," + sLabels[j] + "}");
                        }
                    }
                }
                grams.push("{" + sLabels.toString() + "}");
            }

            for(let label of labels){
                for(let j = i+1; j < i+N; j++){
                    for(let l of this.releases[j].labels){
                        let str = label + "," + l;
                        grams.push(str);
                    }

                    if(this.releases[j].labels.length > 1){
                        let lab = this.releases[j].labels;
                        lab.sort();
                        if(lab.length > 2){
                            for(let i=0;i<lab.length;i++){
                                for(let j=i+1;j<lab.length;j++){
                                    grams.push(label + ",{" + lab[i] + "," + lab[j] + "}");
                                }
                            }
                        }
                        grams.push(label + ",{" + lab.toString() + "}");
                    }
                }
            }
            for(let label of this.releases[i].summarizedLabels){
                for(let j = i+1; j < i+N; j++){
                    for(let l of this.releases[j].summarizedLabels){
                        let str = label + "," + l;
                        summarizedGrams.push(str);
                    }

                    if(this.releases[j].summarizedLabels.length > 1){
                        let lab = this.releases[j].summarizedLabels;
                        lab.sort();
                        if(lab.length > 2){
                            for(let i=0;i<lab.length;i++){
                                for(let j=i+1;j<lab.length;j++){
                                    summarizedGrams.push(label + ",{" + lab[i] + "," + lab[j] + "}");
                                }
                            }
                        }
                        summarizedGrams.push(label + ",{" + lab.toString() + "}");
                    }

                }
            }
        }

        let patternsCounts = [];
        for(let gram of grams){
            let index = patternsCounts.findIndex((c) => c.name.toString() == gram.toString());
            if (index != -1){
                patternsCounts[index].count++;
            }
            else{
                let cat = { name: '', count: 0};
                cat.name = gram.toString();
                cat.count = 1;
                patternsCounts.push(cat);
            }
        }

        let summarizedPatternsCounts = [];
        for(let gram of summarizedGrams){
            let index = summarizedPatternsCounts.findIndex((c) => c.name.toString() == gram.toString());
            if (index != -1){
                summarizedPatternsCounts[index].count++;
            }
            else{
                let cat = { name: '', count: 0};
                cat.name = gram.toString();
                cat.count = 1;
                summarizedPatternsCounts.push(cat);
            }
        }

        fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
            "\nPattern;Count"  +"\n");
        for(let pattern of patternsCounts){
            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
                pattern.name + ";" + pattern.count  +"\n");
        }


        fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
            "\nSummarizedPattern;Count"  +"\n");
        for(let pattern of summarizedPatternsCounts){
            fs.appendFileSync('C:\\Users\\thanosp\\Desktop\\Data\\Classifying_releases\\' + this.outputStatsFiles[i],
                pattern.name + ";" + pattern.count  +"\n");
        }

        //console.log(patternsCounts);
        //print itemfreq(grams)
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
            this.classifyNExport(i);
        }

    }


    setReleasesForClassification(releases){
        for(let release of releases){
            let releaseInfo:ReleaseInformation = {
                releaseName: '',attrsInjected:-1, attrsEjected:-1, attrsTypeUpdated:-1,
                attrsKeyUpdated:-1, tableBirths:-1, tableDeaths:-1, growth:-1
            };
            releaseInfo.releaseName = release.name;
            releaseInfo.attrsInjected = release.stats.getAttributeInsertionsAtExistingTables();
            releaseInfo.attrsEjected = release.stats.getAttributeDeletionsAtExistingTables();
            releaseInfo.attrsTypeUpdated = release.stats.getAttributeTypeAlternations();
            releaseInfo.attrsKeyUpdated = release.stats.getKeyAlternations();
            releaseInfo.tableDeaths= release.stats.getTableDeletions();
            releaseInfo.tableBirths = release.stats.getTableInsertions();
            releaseInfo.growth = release.schemaGrowth;

            this.releases.push(releaseInfo);
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
    summarizedLabels?:Array<string>;
}