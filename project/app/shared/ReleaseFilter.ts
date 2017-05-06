/**
 * Created by thanosp on 6/5/2017.
 */

import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'releaseFilter',
    pure: false
})
export class ReleaseFilter implements PipeTransform {
    transform(releases, filter) {
        if (!releases || !filter) {
            return releases;
        }


        // filter items array, items which match and return true will be kept, false will be filtered out
        return releases.filter((item) => this.applyFilter(item, filter));
    }

    /**
     * Perform the filtering.
     *
     * @param {Book} book The book to compare to the filter.
     * @param {Book} filter The filter to apply.
     * @return {boolean} True if book satisfies filters, false if not.
     */
    applyFilter(release, filter): boolean {
        //console.log("inside release filter!!!")
        //console.log(release);
        //console.log(filter);

        if (new Date(release.dateHuman).getTime() >= new Date(filter[0]).getTime()
        && new Date(release.dateHuman).getTime() <= new Date(filter[1]).getTime()){
            return true;
        }
        /*for (let field in filter) {
            if (filter[field]) {
                if (typeof filter[field] === 'string') {
                    if (release[field].toLowerCase().indexOf(filter[field].toLowerCase()) === -1) {
                        return false;
                    }
                } else if (typeof filter[field] === 'number') {
                    if (release[field] !== filter[field]) {
                        return false;
                    }
                }
            }
        }*/
        return false;
    }
}