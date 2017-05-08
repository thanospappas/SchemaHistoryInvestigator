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

    get(url) : Observable<Release[]>{
        return this.http.get(url)
            .map((res:Response) => {
                return res.json()
            })
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));

    }

}