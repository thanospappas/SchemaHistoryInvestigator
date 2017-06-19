import {CommitInformation} from "../db-controllers/CommitController";
/**
 * Created by thanosp on 14/5/2017.
 */

export class CommitSummary{

    private commitInfo:CommitInformation;
    private commitPositionFromStart:number;
    private  labels:string;
    private finalSummary:string;

    public setCommitInfo(commitInfo:CommitInformation){
        this.commitInfo = commitInfo;
    }

    public setLabels(labels){
        this.labels = labels;
    }

    public getCommitInformation(){
        return this.commitInfo;
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

        let sentence1 = "This commit was done on " +this.commitInfo.commitDate.replace("T", " ").replace("Z", "")
            + ", it was the ";

        if( (this.commitPositionFromStart) > 3)
            sentence1+= this.commitPositionFromStart + "th ";
        else if(this.commitPositionFromStart  == 1)
            sentence1+= this.commitPositionFromStart + "st ";
        else if(this.commitPositionFromStart  == 2)
            sentence1+= this.commitPositionFromStart + "nd ";
        else if(this.commitPositionFromStart  == 3)
            sentence1+= this.commitPositionFromStart + "rd ";

        sentence1 += "from the beginning, belongs to " + this.commitInfo.release +
                " release and was made by " + this.commitInfo.author + ".";

        let sentence2 = " After this commit the schema includes " + this.commitInfo.newTables + " tables and "
            + this.commitInfo.newAttributes + " attributes (as opposed to " + this.commitInfo.oldTables + " tables and " +
            this.commitInfo.oldAttributes + " attributes before it).";
        let sentence3 = " Within the transition incurred by this commit " + this.commitInfo.tableBirths +
            " table births took place resulting in a total of "
            + this.commitInfo.attributeInsertionAtBirth + " attribute insertions along with them and "
            + this.commitInfo.tableDeaths + " table deaths took place resulting in a total of " + this.commitInfo.attributeDeletionAtDeath
            + " attribute deletions along with them.";
        let sentence4 = " In addition, " + this.commitInfo.attributesInsertedAtSurvivingTables + " attributes were added and "
            + this.commitInfo.attributesDeletedAtSurvivingTables + " attributes were deleted at existing tables.";

        let sentence5 = " Also, " + this.commitInfo.attributesUpdated + " attributes updated.";
        let sentence6 = " The sum of the above changes is " + this.commitInfo.totalChanges + " changes.";

        this.finalSummary = sentence1 + sentence2 + sentence3 + sentence4 + sentence5 + sentence6 + "\\n";
    }

    private generateSecondParagraph(){
        let sentence1 = "Along with the SQL data definition file " + this.commitInfo.filesAffected + " other files changed.";
        this.finalSummary += sentence1 + "\\n";
    }

    private generateThirdParagraph(){
        let sentence1 = "This commit is characterized by " + this.labels;
        this.finalSummary += sentence1 + "\\n";
    }


}