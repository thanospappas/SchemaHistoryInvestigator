/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import {ReleaseService} from "../../services/releases.service";
import {ActivatedRoute} from "@angular/router";


@Component({
    selector: 'releases-comp',
    templateUrl: './releases.html',


})
// Component class implementing OnInit
export class ReleaseComponent implements OnInit {

    private selectedReleaseId:number = -1;
    private releases;

    constructor(private petService: ReleaseService, private route:ActivatedRoute, private releaseChanges:ReleaseService) {

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

            });

    }

    isReleaseSet():boolean{
        if(this.selectedReleaseId == -1)
            return false;

        return true;
    }
}
