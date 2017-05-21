import {NgModule} from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import {HttpService} from "./services/http.service";
import {FormsModule} from "@angular/forms";
import {AdminDashboardSection} from "./components/admin/dashboard.component";
import {AdminComponent} from "./admin.component";
/**
 * Created by thanosp on 13/5/2017.
 */

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule
        //RouterModule.forRoot(routes)
    ],
    declarations: [ AdminComponent, AdminDashboardSection ],
    bootstrap:    [ AdminComponent  ],
    providers: [HttpService]
})
export class AdminDashboardModule { }