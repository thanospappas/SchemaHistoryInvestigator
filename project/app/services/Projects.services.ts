/**
 * Created by thanosp on 18/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Release }           from '../../models/project/Release';
import {Observable, Subject} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProjectService {
    // Resolve HTTP using the constructor
    constructor (private http: Http) {
        this.retrieveProjects();
    }
    // private instance variable to hold base url
    private url = 'http://localhost:3004/api/v1/projects/';
    private projects;
    private selectedProject = new Subject<any>();
    projectChanged$ = this.selectedProject.asObservable();

    // Fetch all existing comments
    retrieveProjects() : Observable<Release[]>{
        // ...using get request
        return this.http.get(this.url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => { this.projects = res.json(); this.selectedProject = this.projects[0]; return res.json()})
            //...errors if any
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));

    }

    getProjects(){
        return this.projects;
    }

    setSelectedProject(project){
        this.selectedProject = project;
        console.log("I am changing...");
        console.log(this.selectedProject);
    }

    getSelectedProject(){
        return this.selectedProject;
    }


}
