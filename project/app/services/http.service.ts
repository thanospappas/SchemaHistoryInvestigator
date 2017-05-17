/**
 * Created by thanosp on 17/4/2017.
 */

import { Injectable }     from '@angular/core';
import {Http, RequestOptions, Response} from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable} from 'rxjs/Rx';
import {Headers} from '@angular/http';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HttpService {

    private headers = new Headers({'Content-Type': 'application/json'});
    // Resolve HTTP using the constructor
    constructor (private http: Http) {}

    get(url) : Observable<Release[]>{
        return this.http.get(url)
            .map((res:Response) => {
                return res.json()
            })
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error');

            });

    }

    update(url, object): Promise<any>{
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let body = JSON.stringify(object);
        return this.http
            .put(url,body , {headers: headers}).toPromise()
            .then(() => body)
            .catch();
    }

}