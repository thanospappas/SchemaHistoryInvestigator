import {Component, OnChanges, OnInit} from "@angular/core";
import {ProjectService} from "../../services/Projects.services";
import {serverPort} from "../../config/server-info";
import {HttpService} from "../../services/http.service";
/**
 * Created by thanosp on 13/5/2017.
 */

@Component({
    selector: 'admin-dashboard',
    templateUrl: './dashboard.html',

})

export class AdminDashboardSection implements OnInit {

    private loginScreenOn:boolean;
    private projects;
    private textGeneratingCommit;
    private textGeneratingRelease;
    private commitOn:boolean = false;
    private releaseOn:boolean = false;
    private selectedProject = 1;
    private showSuccessfulMessage = false;

    constructor(private projectService:ProjectService, private httpService:HttpService) {    }


    ngOnInit() {
        this.loginScreenOn = true;
        this.textGeneratingCommit = false;
        this.textGeneratingRelease = false;
        this.projectService.retrieveProjects()
            .subscribe(projects => {
                    projects.splice(1,1);
                    this.projects = projects;
                },
                err => {
                    console.log(err);
                }
            );

    }


    login(user, pass){
        console.log(user);
        console.log(pass);
        if(user == "admin" && pass == "admin"){
            this.loginScreenOn = false;
        }

    }

    generateText(){
        console.log(this.releaseOn);
        console.log(this.commitOn);
        console.log(this.selectedProject);
        let url ="http://localhost:" + serverPort + "/api/v1/projects/" +
            this.selectedProject;

        this.showSuccessfulMessage = false;

        if(this.releaseOn){
            this.textGeneratingRelease =true;
            this.httpService.get(url + "/releases?generate_summary=true")
                .subscribe(commits => {
                        this.textGeneratingRelease =false;
                    },
                    err => {
                        console.log(err);
                    }
                );
        }
        if(this.commitOn){
            this.textGeneratingCommit = true;
            this.httpService.get(url + "/commits?generate_summary=true")
                .subscribe(res => {
                        this.textGeneratingCommit = false;
                        console.log(res);
                        if(res){
                            this.showSuccessfulMessage = true;
                        }
                    },
                    err => {
                        console.log(err);
                    }
                );
        }


    }


}
