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
import {serverPort} from "../config/server-info";

@Injectable()
export class ProjectService {

    constructor (private http: Http) {
        this.retrieveProjects();
    }

    private url = 'http://localhost:' + serverPort + '/api/v1/projects/';
    private projects;
    //private selectedProject:Subject<Project> = new Subject<Project>();
    private selProject:Project = {selectedPrj: '', projectId: -1};
    projectChanged$ = new ReplaySubject(1);
    //public activeProject:ReplaySubject<any> = new ReplaySubject(1);

    retrieveProjects() : Observable<Release[]>{
        return this.http.get(this.url)
            .map((res:Response) => {
                this.projects = res.json();
                this.selProject.selectedPrj = this.projects[0].Name;
                this.selProject.projectId = this.projects[0].ID;

                this.setSelectedProject(this.selProject);
                return res.json()
            })
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error')
        });
    }

    retrieveProjects1(id) : Observable<Release[]>{
        return this.http.get(this.url)
            .map((res:Response) => {
                this.projects = res.json();
                this.selProject.selectedPrj = this.projects[id].Name;
                this.selProject.projectId = this.projects[id].ID;

                this.setSelectedProject(this.selProject);
                return res.json()
            })
            .catch((error:any) => {
                console.log(error);
                return Observable.throw(error.json().error || 'Server error')
            });
    }

    getProjects(){
        return this.projects;
    }

    getSelectedProjectData(){
        return this.selProject;
    }

    setSelectedProject(project:Project){
        this.selProject = project;
        this.projectChanged$.next(this.selProject);
    }

    getSelectedProject(){
        return this.projectChanged$;
    }


}
