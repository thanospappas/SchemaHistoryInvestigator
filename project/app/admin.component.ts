/**
 * Created by thanosp on 13/5/2017.
 */


import { Component } from '@angular/core';
import {ProjectService} from "./services/Projects.services";


@Component({
    selector: 'admin-section',
    templateUrl: './views/main-admin-app.html',

    providers: [ProjectService],

})
export class AdminComponent  {
    name = 'Angular';

}
