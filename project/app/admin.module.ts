import {NgModule} from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import {TopNavBar} from './components/menu/topnavbar.component';
import {Sidebar} from './components/menu/sidebar.component';
import {AreaChart} from './components/summary/charts/change-breakdown.component';
import {DevelopmentChart} from './components/summary/development-style/development-style.component';
import { HttpModule } from '@angular/http';
import {ProjectService} from "./services/Projects.services";
import {ReleaseService} from "./services/releases.service";
import { RouterModule }   from '@angular/router';
import {ReleaseComponent} from "./components/releases/release-info";
import {routes} from './app.routes';
import {CommitComponent} from "./components/commits/Commit";
import {SummarySection} from "./components/summary/summary.component";
import {HttpService} from "./services/http.service";
import {ReleaseFilter} from "./shared/ReleaseFilter";
import {FabButton} from "./shared/FabButton";
import {FabToggle} from "./shared/FabToggle";
import {Fab} from "./shared/Fab";
import {FormsModule} from "@angular/forms";
import {CommitService} from "./services/commits.service";
import {NewlinesFilter} from "./shared/NewlinesFilter";
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