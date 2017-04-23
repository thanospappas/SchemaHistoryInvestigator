/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Observable } from 'rxjs/Observable';
import {ReleaseService} from "../../services/releases.service";
import {ActivatedRoute} from "@angular/router";
import {HttpService} from "../../services/http.service";
import {serverPort} from "../../config/server-info";
import {ProjectService} from "../../services/Projects.services";
import {BreakdownChart} from "../../shared/BreakdownChart";


@Component({
    selector: 'releases-comp',
    templateUrl: './releases.html',

})
// Component class implementing OnInit
export class ReleaseComponent implements OnInit {

    private selectedReleaseId:number = -1;
    private releases;
    private commits;
    private commitChangesChart;
    private $SIDEBAR_MENU;
    constructor(private route:ActivatedRoute, private releaseChanges:ReleaseService, private httpService:HttpService, private projectService:ProjectService) {
        this.commitChangesChart = new BreakdownChart(".release-summary");
    }

    // Load data ones componet is ready
    ngOnInit() {
        // Pass retreived pets to the property
       // this.dogs = this.petService.findPets('dog');
        this.route.params.subscribe(params => {
            let id = params['id'];
            console.log(id);
            if(id){
                this.selectedReleaseId = id;

                this.$SIDEBAR_MENU = $('#sidebar-menu');


                var $li = $('.releases-menu-item');
                var $currentli = $('#sidebar-menu').find('li.active-sm');
                $currentli.removeClass('active active-sm');
                $li.addClass('active active-sm');


            }
            // Retrieve Pet with Id route param
            //this.petService.findPetById(id).subscribe(dog => this.dog = dog);
        });
        this.releaseChanges.getReleaseChanges().subscribe(
            releases => {
                this.releases = releases;
                console.log(releases);
                if(!this.isReleaseSet()){
                    this.selectedReleaseId = releases[0].releaseID;
                }
                console.log("Selected id: " + this.selectedReleaseId);
                this.retrieveCommits();
            });



    }

    retrieveCommits(){
        let url = "http://localhost:" + serverPort + "/api/v1/projects/" +
            + this.projectService.getSelectedProjectData().projectId + "/releases/" + this.selectedReleaseId;
        this.httpService.get(url)
            .subscribe(commits => {
                    this.commits = commits;
                    console.log(this.commits);
                    this.commitChangesChart.setReleases(this.commits);
                    this.commitChangesChart.createChart();

                },
                err => {
                    console.log(err);
                }
            );
    }


    isReleaseSet():boolean{
        if(this.selectedReleaseId == -1)
            return false;

        return true;
    }
}
