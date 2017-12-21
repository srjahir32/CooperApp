import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { Sim } from '@ionic-native/sim';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SQLite } from '@ionic-native/sqlite';
import { IonicStorageModule } from '@ionic/storage';
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { HttpModule } from "@angular/http";
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DetailsPage } from '../pages/details/details';
import { SettingsPage } from '../pages/settings/settings';
import { ReportsPage } from '../pages/reports-page/reports-page';
import { DataService } from '../providers/data-service';
import { AutoCompleteTextService } from '../providers/auto-complete-text-service';
import { LocationService } from '../providers/location-service';
import { ContactService } from '../providers/contact-service';
import { ShareService } from '../providers/share-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DetailsPage,
    SettingsPage,
    ReportsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AutoCompleteModule,
    FormsModule,
    TextMaskModule,
    IonicModule.forRoot(MyApp,{
        platforms : {
          ios : {
            scrollAssist: false,    
            autoFocusAssist: false
          },
          android : {
            scrollAssist: false,    
            autoFocusAssist: false
          }
        }
      }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DetailsPage,
    SettingsPage,
    ReportsPage
  ],
  providers: [
    StatusBar,
    Keyboard,
    Geolocation,
    Sim,
    Diagnostic,
    SpinnerDialog,
    SQLite,
    SplashScreen,
    DataService,
    DatePipe,
    AutoCompleteTextService,
    LocationService,
    ContactService,
    ShareService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
