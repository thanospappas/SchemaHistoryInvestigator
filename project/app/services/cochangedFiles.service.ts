/**
 * Created by thanosp on 17/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CochangedService {
    // Resolve HTTP using the constructor
    constructor (private http: Http) {}
    // private instance variable to hold base url
    private releasesUrl = 'http://localhost:3004/api/v1/projects/1/files_affected';
    // private commentsUrl = 'http://578f454de2fa491100415d08.mockapi.io/api/Comment';

    // Fetch all existing comments
    getCochangedFiles() : Observable<Release[]>{
        // ...using get request
        return this.http.get(this.releasesUrl)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));

    }

}