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
import {ReleaseFilter} from "../shared/ReleaseFilter";

@Injectable()
export class ReleaseService {

    private releases;
    releasesChanged$ = new ReplaySubject(1);

    private selectedReleases;
    selectedReleases$ = new ReplaySubject(1);

    private selectedRelease;
    selectedRelease$ = new ReplaySubject(1);

    // Resolve HTTP using the constructor
    constructor (private http: Http, private releaseFilter:ReleaseFilter) {}

    // Fetch all existing comments
    getReleases(url:string) : Observable<Release[]>{
        return this.http.get(url)
            .map((res:Response) => {
                this.releases = res.json();
                this.setReleases(this.releases);
                this.setSelectedReleases(this.releases);
                console.log(this.releases);
                return res.json();

            })
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error')
            });

    }

    setReleases(releases){
        this.releases = releases;
        this.releasesChanged$.next(this.releases);

    }

    getReleaseData(){
        return this.releases;
    }

    getReleaseChanges(){
        return this.releasesChanged$;
    }

    setSelectedReleases(releases){
        let xx = this.releaseFilter.transform(this.releases,releases);
        this.selectedReleases = xx;
        this.selectedReleases$.next(this.selectedReleases);
    }

    getSelectedReleases(){
        return this.selectedReleases$;
    }

    setSelectedRelease(release){
        this.selectedRelease = release;
        this.selectedRelease$.next(this.selectedRelease);
    }

    getSelectedRelease(){
        return this.selectedRelease$;
    }

}
