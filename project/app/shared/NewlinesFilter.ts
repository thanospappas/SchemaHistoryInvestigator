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
        //if (!releases || !filter) {
        //    return releases;
        //}

        console.log(text.replace(/(?:\r\n|\r|\n)/g,'<br/>'));
        console.log(text.replace('\n','<br/>'));
        //console.log(filter);

        return text.replace(/\\n/g,'<p></p>');
        // filter items array, items which match and return true will be kept, false will be filtered out
      //  return releases.filter((item) => this.applyFilter(item, filter));
    }

}