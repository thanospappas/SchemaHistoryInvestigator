/**
 * Created by thanosp on 17/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response} from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HttpService {
    // Resolve HTTP using the constructor
    constructor (private http: Http) {}

    // Fetch all existing comments
    get(url) : Observable<Release[]>{
        // ...using get request
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => {
                console.log(res);
                return res.json()
            })
            //...errors if any
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));

    }

}