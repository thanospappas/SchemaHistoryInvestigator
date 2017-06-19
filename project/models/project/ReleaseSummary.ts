/**
 * Created by thanosp on 15/5/2017.
 */

import {CommitInformation} from "../db-controllers/CommitController";
import {Release} from "./Release";
import {ReleaseClassifier, ReleaseInformation} from "../Classifier/ReleaseClassifier";


export class ReleaseSummary{

    private releaseInfo:Release;
    private commitPositionFromStart:number;
    private labels:string;
    private finalSummary:string;

    public setReleaseInfo(releaseInfo:Release){
        this.releaseInfo = releaseInfo;
    }

    public setLabels(labels){
        this.labels = labels;
    }

    public getReleaseInformation(){
        return this.releaseInfo;
    }

    public setPosition(pos:number){
        this.commitPositionFromStart = pos+1;
        console.log(this.commitPositionFromStart);
    }

    public getFinalSummary():string{
        return this.finalSummary;
    }

    public generateParagraphs(){
        this.generateFirstParagraph();
        this.generateSecondParagraph();
        this.generateThirdParagraph();
        console.log(this.finalSummary);
    }

    private generateFirstParagraph(){

        let sentence1 = "This release was released on " +this.releaseInfo.dateHuman
            + ", it was the ";

        if( (this.commitPositionFromStart) > 3)
            sentence1+= this.commitPositionFromStart + "th ";
        else if(this.commitPositionFromStart  == 1)
            sentence1+= this.commitPositionFromStart + "st ";
        else if(this.commitPositionFromStart  == 2)
            sentence1+= this.commitPositionFromStart + "nd ";
        else if(this.commitPositionFromStart  == 3)
            sentence1+= this.commitPositionFromStart + "rd ";

        sentence1 += "from the beginning, it lasted " + Math.ceil(this.releaseInfo.duration) +
            " days and includes " + this.releaseInfo.contributorNumber + " contributors.";

        let sentence2 = " In this release there are " + this.releaseInfo.stats.getTablesAtEnd() + " tables and "
            + this.releaseInfo.stats.getAttributesAtEnd() + " attributes (compared to " + this.releaseInfo.stats.getTablesAtStart()
            + " tables and " + this.releaseInfo.stats.getAttributesAtStart() + "  attributes that the schema had at its beginning).";

        let sentence3 = " Within this release, " + this.releaseInfo.stats.getTableInsertions()
            + " table births took place resulting in a total of "
            + this.releaseInfo.stats.getAttributesInsertedAtNewTables() + " attribute insertions along with them and "
            + this.releaseInfo.stats.getTableDeletions() + " table deaths took place resulting in a total of "
            + this.releaseInfo.stats.getAttributesDeletedAtDeletedTables()  + " attribute deletions along with them.";

        let sentence4 = " In addition, " + this.releaseInfo.stats.getAttributeInsertionsAtExistingTables() + " attributes were added and "
            + this.releaseInfo.stats.getAttributeDeletionsAtExistingTables() + " attributes were deleted at pre-existing/survivor tables.";

        let sentence5 = " Also, " + this.releaseInfo.stats.getAttributesUpdates() + " attributes updated.";

        let sentence6 = " The sum of the above changes is " + (this.releaseInfo.stats.getAttributesUpdates()
            + this.releaseInfo.stats.getAttributeDeletionsAtExistingTables() +  this.releaseInfo.stats.getAttributeInsertionsAtExistingTables()
            + this.releaseInfo.stats.getAttributesDeletedAtDeletedTables() + this.releaseInfo.stats.getAttributesInsertedAtNewTables()) + " changes.";

        this.finalSummary = sentence1 + sentence2 + sentence3 + sentence4 + sentence5 + sentence6 + "\\n";
    }

    private generateSecondParagraph(){
        //let sentence1 = "In this release" + this.releaseInfo.filesAffected + " files were changed along with " +
       //     "the sql file holding the schema of the database..";
        //this.finalSummary += sentence1 + "\\n";
    }

    private generateThirdParagraph(){
        /*let releaseInfo:ReleaseInformation = {
            releaseName: '',attrsInjected:-1, attrsEjected:-1, attrsTypeUpdated:-1,
            attrsKeyUpdated:-1, tableBirths:-1, tableDeaths:-1, growth:-1
        };
        releaseInfo.releaseName = this.releaseInfo.name;
        releaseInfo.attrsInjected = this.releaseInfo.stats.getAttributeInsertionsAtExistingTables();
        releaseInfo.attrsEjected = this.releaseInfo.stats.getAttributeDeletionsAtExistingTables();
        releaseInfo.attrsTypeUpdated = this.releaseInfo.stats.getAttributeTypeAlternations();
        releaseInfo.attrsKeyUpdated = this.releaseInfo.stats.getKeyAlternations();
        releaseInfo.tableDeaths= this.releaseInfo.stats.getTableDeletions();
        releaseInfo.tableBirths = this.releaseInfo.stats.getTableInsertions();
        releaseInfo.growth = this.releaseInfo.schemaGrowth;
        let rc:ReleaseClassifier = new ReleaseClassifier();
        rc.addRelease(releaseInfo);*/

        let sentence1 = "This release is characterized by " + this.labels;//"High …, Moderate .. and High …. so we conclude that it is a growth commit.";
        this.finalSummary += sentence1 + "\\n";
    }


}