import { Component } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
import { DetailsPage } from '../pages/details/details';
// import { ShowToast } from '../providers/show-toast'

declare var navigator: any;
declare var window: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(public platform: Platform, 
              public statusBar: StatusBar,
              public keyboard: Keyboard,
              public storage: Storage, 
              public splashScreen: SplashScreen,
              public app: App) {
    this.initializeApp();
    this.checkNetwork();
    // this.storage.set('user', {username:'',phone:'',buildno:''});
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();  
      if (this.platform.is('ios') || this.platform.is('android')) {
          this.keyboard.disableScroll(true);
      }
      let db = new SQLite();
          db.create({
              name: "cooper.db",
              location: "default"
          }).then((db: SQLiteObject) => {
              db.executeSql("CREATE TABLE IF NOT EXISTS customeraddlog (id INTEGER PRIMARY KEY AUTOINCREMENT, customerName TEXT, contact TEXT, location TEXT, comment TEXT, orderValue TEXT, vibe TEXT, salesmanName TEXT, salesmanContact TEXT, lat TEXT, long TEXT)", {}).then((data) => {
                  console.log("TABLE CREATED: ", data);
              }, (error) => {
                  console.error("Unable to execute sql", error);
              })
          }, (error) => {
              console.error("Unable to open database", error);
          });

      this.platform.registerBackButtonAction(() => {
        let nav = this.app.getActiveNav();
        if (nav.canGoBack()){ //Can we go back?
          nav.pop();
        }else{
          this.platform.exitApp(); //Exit from app
        }
      });
    });
    this.storage.get('user').then((val) => {
      if(val != null){
        if(val.username && val.phone){
            this.rootPage = DetailsPage;
        }else{
            this.rootPage = HomePage;
        }
      }else{
        this.storage.set('user', {username:'',phone:'',buildno:''}); 
        this.storage.set('apiCount', {"todaydate":new Date(), "noOfRequests":0});       
        this.rootPage = HomePage;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // do whatever you need to do here.
      setTimeout(() => {
        this.splashScreen.hide();
      }, 100);
    });
  }
  checkNetwork() {
      this.platform.ready().then(() => {
          var networkState = navigator.connection.type;
          if(networkState == 'none'){            
            window.plugins.toast.show("Network connection is not available", "short", "center");
          }else{
            console.log('online');
          }
      });
  }
}

