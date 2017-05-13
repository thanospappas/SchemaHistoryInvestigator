import {Component, OnChanges, OnInit} from "@angular/core";
import {ProjectService} from "../../services/Projects.services";
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

    constructor(private projectService:ProjectService) {    }


    ngOnInit() {
        this.loginScreenOn = true;

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


}
