/**
 * Created by thanosp on 12/5/2017.
 */

/**
 * Created by thanosp on 6/5/2017.
 */

import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'newLineFilter',

})
export class NewlinesFilter implements PipeTransform {

    transform(text:string) {

        return text.replace(/\\n/g,'<p></p>');
        // filter items array, items which match and return true will be kept, false will be filtered out
      //  return releases.filter((item) => this.applyFilter(item, filter));
    }

}