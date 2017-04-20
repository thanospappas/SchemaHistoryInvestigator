/**
 * Created by thanosp on 15/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable, ReplaySubject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ReleaseService {

    private releases;
    releasesChanged$ = new ReplaySubject(1);

    // Resolve HTTP using the constructor
    constructor (private http: Http) {}


    // Fetch all existing comments
    getReleases(url:string) : Observable<Release[]>{
        // ...using get request
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => {

                this.releases = res.json();

                this.setReleases(this.releases);
                return res.json();

            })
            //...errors if any
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error')
            });

    }

    setReleases(releases){
        this.releases = releases;
        this.releasesChanged$.next(this.releases);

    }

    getReleaseChanges(){
        return this.releasesChanged$;
    }

}
