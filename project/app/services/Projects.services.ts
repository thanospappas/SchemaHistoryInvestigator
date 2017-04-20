/**
 * Created by thanosp on 18/4/2017.
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Release }           from '../../models/project/Release';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Project} from "../shared/Project";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class ProjectService {
    // Resolve HTTP using the constructor
    constructor (private http: Http) {
        this.retrieveProjects();
    }
    // private instance variable to hold base url
    private url = 'http://localhost:3002/api/v1/projects/';
    private projects;
    //private selectedProject:Subject<Project> = new Subject<Project>();
    private selProject:Project = {selectedPrj: '', projectId: -1};
    projectChanged$ = new ReplaySubject(1);
    //public activeProject:ReplaySubject<any> = new ReplaySubject(1);

    // Fetch all existing comments
    retrieveProjects() : Observable<Release[]>{
        // ...using get request
        return this.http.get(this.url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => {
                this.projects = res.json();
                this.selProject.selectedPrj = this.projects[0].Name;
                this.selProject.projectId = this.projects[0].ID;

                this.setSelectedProject(this.selProject);
                return res.json()
            })
            //...errors if any
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error')
        });

    }

    getProjects(){
        return this.projects;
    }

    setSelectedProject(project:Project){
        this.selProject = project;
        //this.selectedProject.next(this.selProject);
        this.projectChanged$.next(this.selProject);
        //this.activeProject.next("haha");
        //console.log("I am changing...");
        //console.log(this.selectedProject);
    }

    getSelectedProject(){
        return this.projectChanged$;
    }


}
