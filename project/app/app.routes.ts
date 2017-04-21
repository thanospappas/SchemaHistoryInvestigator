import {ReleaseComponent} from "./components/releases/release-info";
import {Routes} from "@angular/router";
import {AppComponent} from "./app.component";
import {CommitComponent} from "./components/commits/Commit";
import {SummarySection} from "./components/summary/summary.component";
/**
 * Created by thanosp on 21/4/2017.
 */

export const routes: Routes = [
    //{ path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: '' , component: SummarySection},
    //{ path: '/', component: AppComponent },
    { path: 'releases', component: ReleaseComponent },
    { path: 'releases/:id', component: ReleaseComponent },
    { path: 'commits', component: CommitComponent }
];