/**
 * Created by thanosp on 15/5/2017.
 */

import {CommitInformation} from "../db-controllers/CommitController";
import {Release} from "./Release";


export class ReleaseSummary{

    private releaseInfo:Release;
    private commitPositionFromStart:number;

    private finalSummary:string;

    public setReleaseInfo(releaseInfo:Release){
        this.releaseInfo = releaseInfo;
    }

    public getReleaseInformation(){
        return this.releaseInfo;
    }

    public setPosition(pos:number){
        this.commitPositionFromStart = pos+1;
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

        let sentence1 = "This release was done on " +this.releaseInfo.dateHuman
            + ", it was the ";

        if( (this.commitPositionFromStart) > 3)
            sentence1+= this.commitPositionFromStart + "th ";
        else if(this.commitPositionFromStart  == 1)
            sentence1+= this.commitPositionFromStart + "st ";
        else if(this.commitPositionFromStart  == 2)
            sentence1+= this.commitPositionFromStart + "nd ";
        else if(this.commitPositionFromStart  == 3)
            sentence1+= this.commitPositionFromStart + "rd ";

        sentence1 += "from the beginning, it lasted " + this.releaseInfo.duration +
            " days and have " + this.releaseInfo.contributorNumber + " contributors.";

        let sentence2 = " In this release there are " + this.releaseInfo.stats.getSchemaSizeTable() + " tables on average and "
            + this.releaseInfo.stats.getSchemaSizeAttribute() + " attributes.";

        let sentence3 = " In this transition " + this.releaseInfo.stats.getTableInsertions()
            + " table births took place resulting a total of "
            + this.releaseInfo.stats.getAttributesInsertedAtNewTables() + " attribute insertions along with them and "
            + this.releaseInfo.stats.getTableDeletions() + " table deaths took place resulting a total of "
            + this.releaseInfo.stats.getAttributesDeletedAtDeletedTables()  + " attribute deletions along with them.";

        let sentence4 = " In addition, " + this.releaseInfo.stats.getAttributeInsertionsAtExistingTables() + " attributes were added and "
            + this.releaseInfo.stats.getAttributeDeletionsAtExistingTables() + " attributes were deleted at existing tables.";

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
        let sentence1 = "This release is characterized by High …, Moderate .. and High …. so we conclude that it is a growth commit.";
        this.finalSummary += sentence1 + "\\n";
    }


}