/**
 * Created by thanosp on 24/5/2017.
 */


import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'orderByScore',

})
export class IssuesFilter implements PipeTransform {

    transform(issues: Array<any>) {
         let sortedIssues = issues.sort((a, b) => {
            //*(-1): desc sorting
            return (a.USEFUL_SCORE - b.USEFUL_SCORE)*(-1);
        });

        return sortedIssues;
    }

}