import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import {  DatePipe } from '@angular/common';
import { DataService } from '../../providers/data-service';

/**
 * Generated class for the ReportsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var window: any;
declare var navigator: any;
@IonicPage()
@Component({
  selector: 'page-reports-page',
  templateUrl: 'reports-page.html',
  providers: [DataService]
})
export class ReportsPage {
  toDay: any;
  event: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public platform: Platform, 
              public dataService: DataService,
              public datepipe: DatePipe) {
    this.toDay = new Date();
    this.event = {
      month: this.datepipe.transform(this.toDay, 'yyyy-MM-dd'),
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportsPage');
  }
  createReport(date) { 
    var networkState = navigator.connection.type;
    // console.log(networkState)
    if(networkState === 'none') {
      window.plugins.toast.show("Network connection is not available", "short", "center");
    } else {
      // var send_date = new Date(date);
      // var str = new String(send_date);
      // if(str.search("Sat") != -1 || str.search("Sun") != -1) { 
      //   this.showToast("Please choose weekdays only", "center");
      // } else {
      //   send_date.setDate(send_date.getDate());
      // } 
      this.dataService.getReport(date).subscribe(
                  response => {
                    if(response.status == 'success'){
                      this.showToast("Excel sheet has been generated successfully!", "center");   
                      }                  
                  },
                  err => {
                      console.log(err);
                  },
                  () => console.log('Get json Complete')
              );
    }
  }
  showToast(message, position) {
      this.platform.ready().then(() => {
          window.plugins.toast.show(message, "short", position);
      });
  }

}
