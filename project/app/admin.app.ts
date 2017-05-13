/**
 * Created by thanosp on 13/5/2017.
 */


import { AppModule } from './app.module';
import {enableProdMode} from '@angular/core';
import {AdminComponent} from "./admin.component";
import {AdminDashboardModule} from "./admin.module";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

/* comment out this line to enable production mode
 enableProdMode();
 */

platformBrowserDynamic().bootstrapModule(AdminDashboardModule);
