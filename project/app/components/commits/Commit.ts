/**
 * Created by thanosp on 21/4/2017.
 */

// Imports
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import {ReleaseService} from "../../services/releases.service";


@Component({
    selector: 'commits',
    templateUrl: './commits.html',


})
// Component class implementing OnInit
export class CommitComponent implements OnInit {
    // Private property for binding
    //dogs: Observable<Pet[]>;
    constructor(private petService: ReleaseService) {

    }

    // Load data ones componet is ready
    ngOnInit() {
        // Pass retreived pets to the property
        // this.dogs = this.petService.findPets('dog');
    }
}
