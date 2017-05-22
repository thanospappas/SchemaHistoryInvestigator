/**
 * Created by thanosp on 22/5/2017.
 */

import {Component, Input, OnInit}  from '@angular/core';


@Component({
    selector: 'notifications',
    templateUrl: './notifications.html'
})

export class NotificationsComponent implements OnInit {

    @Input() showSuccess:boolean;

    constructor () {}

    ngOnInit(){

    }

}