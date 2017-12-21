import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe} from '@angular/common';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { Validators,FormGroup, FormControl} from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/debounceTime';
import { SettingsPage } from '../settings/settings';
import { ReportsPage } from '../reports-page/reports-page';
import { Storage } from '@ionic/storage';
import { DataService } from '../../providers/data-service';
import { AutoCompleteTextService } from '../../providers/auto-complete-text-service';
import { LocationService } from '../../providers/location-service';
import { ContactService } from '../../providers/contact-service';
import { ShareService } from '../../providers/share-service';

/**
 * Generated class for the Details page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var window: any;
declare var navigator: any;
declare var google: any;
@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
  providers: [DataService, AutoCompleteTextService, LocationService,ContactService,ShareService]
})
export class DetailsPage implements OnInit{
  @ViewChild('custname') custname: any;
  @ViewChild('custlocation') custlocation: any;
  @ViewChild('contact') contact: any;
  userCallInfo: any;
  detailForm: FormGroup;
  previousDay: any;
  userInfo:any = [];
  newdate: any;
  count: number;
  icon: any;
  showDetails: boolean;
  networkState: any;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public platform: Platform,
              public dataService: DataService, 
              public autoService: AutoCompleteTextService,
              public locationService: LocationService,
              public contactService: ContactService,
              public storage: Storage,
              public datepipe: DatePipe,
              public geolocation: Geolocation,
              public spinner: SpinnerDialog,
              private shareService : ShareService,
              private diagnostic: Diagnostic,
              private alertCtrl: AlertController) {    
    this.icon ='add-circle';
    this.showDetails = false;
    this.userCallInfo = {};   
  }  

  ionViewWillLoad() {
    console.log('ionViewDidLoad Details');
    this.detailForm = new FormGroup({
        comment: new FormControl(''),
        order: new FormControl('', Validators.compose([
          Validators.required
        ])),
        vibe: new FormControl('', Validators.compose([
          Validators.required
        ]))
      });    

      this.detailForm.valueChanges
      .debounceTime(400)
      .subscribe(data =>this.onValueChanged(data));
  }  

  onValueChanged(data?: any) {
    if (!this.detailForm) { return; }
    const form = this.detailForm;
    for (const field in this.formErrors) {
      // clear previous error message
      this.formErrors[field] = [];
      this.detailForm[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid && control.errors && control.touched) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field].push(messages[key]);
        }
      }
    }
  }

  formErrors = {
    'order': [],
    'vibe': []
  };

  validationMessages = {
    'order': {
      'required':      'Order is required.'
    },
    'vibe': {
      'required':      'Vibe is required.'
    }
    
  };

  ionViewDidEnter(){
    this.storage.get('user').then((val) => {
         this.userInfo = val;
         this.ngOnInit();
    });

    this.networkState = navigator.connection.type;
    if(this.networkState != 'none') {
        let db = new SQLite();
          db.create({
              name: "cooper.db",
              location: "default"
          }).then((db: SQLiteObject) => {
              db.executeSql("SELECT * FROM customeraddlog", []).then((data) => {
                //  console.log(data);
                 if(data.rows.length > 0) {
                   this.storage.get('apiCount').then((val) => {
                      this.newdate = this.datepipe.transform(val.todaydate, 'dd-MMM-yyyy');
                      this.count = val.noOfRequests;
                    });
                    for(var i = 0; i < data.rows.length; i++) {
                      // console.log(data.rows.item(i));
                      var record_id = data.rows.item(i).id;
                      var offline_data = {
                        customerName: data.rows.item(i).customerName,
                        contact: data.rows.item(i).contact,
                        location: data.rows.item(i).location,
                        comment: data.rows.item(i).comment,
                        order: data.rows.item(i).orderValue,
                        vibe: data.rows.item(i).vibe,
                        salesmanName: data.rows.item(i).salesmanName,
                        salesmanContact: data.rows.item(i).salesmanContact,
                        latitude: data.rows.item(i).lat,
                        longitude:  data.rows.item(i).long
                      }
                      this.dataService.addCallLog(offline_data).subscribe(
                          response => {
                            if(response.message === 'Record created successfully'){
                              this.showToast(response.message, "center");
                              var compareToday = this.datepipe.transform(new Date(), 'dd-MMM-yyyy')
                              if(this.newdate == compareToday) {
                                this.count++;
                                this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests":this.count});
                              } else {
                                this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests": 1});
                              }
                              db.executeSql("DELETE FROM customeraddlog WHERE id='"+record_id+"'", []).then((data) => {
                                console.log(data);
                              },err => {
                                console.log(err);
                              })
                            }
                          },
                          err => {
                              console.log(err);
                              this.showToast("Record not created", "center");
                          },
                          () => console.log('Get json Complete')
                      );
                    }
                }
              }, (error) => {
                  console.log("ERROR: " + JSON.stringify(error));
              });
          }, (error) => {
              console.error("Unable to open database", error);
          });
    }
    
  }

  getUser(){
    this.shareService.setUserName(this.custname.getValue());
    this.diagnostic.isLocationEnabled().then(this.success).catch(this.errorCallback);
  }

  getLocation(){
    this.diagnostic.isLocationEnabled().then(this.successCallback).catch(this.errorCallback);
  }
  successCallback = (isAvailable) => {      
      if(isAvailable){
        this.geolocation.getCurrentPosition().then((resp) => {
          this.shareService.setLatLong(resp.coords.latitude, resp.coords.longitude);
          this.dataService.getLocationPlace(resp.coords.latitude, resp.coords.longitude)
                .subscribe(response => {
                  this.custlocation.keyword = response.results[0].formatted_address;                 
                  },
                  err => {
                      console.log(err);
                  },
                  () => console.log('Get json Complete')
              );               
          }).catch((error) => {
            console.log('Error getting location', error);
          });
      }else{
          let alert = this.alertCtrl.create({
            title: 'Salescall would like to access your location?',
            message: 'Salescall picks you up exactly where you are. Choose "Allow" so the app can find your location.',
            buttons: [
              {
                text: 'Deny',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Allow',
                handler: () => {
                  if(this.platform.is('android')){
                    this.diagnostic.switchToLocationSettings();
                  }
                  if(this.platform.is('ios')){
                    this.diagnostic.switchToSettings();
                  }
                }
              }
            ]
          });
          alert.present();        
      }
    };

    success = (isAvailable) => {
      if(isAvailable){
        this.geolocation.getCurrentPosition().then((resp) => { 
            this.shareService.setLatLong(resp.coords.latitude, resp.coords.longitude);
          }).catch((error) => {
            console.log('Error getting location', error);
          });
      }else{
          let alert = this.alertCtrl.create({
            title: 'Salescall would like to access your location?',
            message: 'Salescall picks you up exactly where you are. Choose "Allow" so the app can find your location.',
            buttons: [
              {
                text: 'Deny',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Allow',
                handler: () => {
                  if(this.platform.is('android')){
                    this.diagnostic.switchToLocationSettings();
                  }
                  if(this.platform.is('ios')){
                    this.diagnostic.switchToSettings();
                  }
                }
              }
            ]
          });
          alert.present();        
      }
  };
  errorCallback = (e) => console.error(e);

  ngOnInit(){
    this.storage.ready().then(() => {
       // Or to get a key/value pair
      this.networkState = navigator.connection.type;
        // console.log(networkState)
      if(this.networkState === 'none') {
        window.plugins.toast.show("No internet connection", "short", "center");
      } else {
          this.spinner.show("Getting call data","Loading..");
          this.storage.get('user').then((val) => {
            this.userInfo = val;
            this.previousDay = new Date();
            var str = new String(this.previousDay);
            if(str.search("Mon") != -1) {
              this.previousDay.setDate(this.previousDay.getDate()-3);    
            } else if(str.search("Sun") != -1) {
              this.previousDay.setDate(this.previousDay.getDate()-2);
            } else {
              this.previousDay.setDate(this.previousDay.getDate()-1);
            }
            //called after the constructor and called  after the first ngOnChanges()
            this.dataService.getData(this.previousDay,val.phone).subscribe(
                    response => {
                      if(response.message === "success"){
                        response.data[0].memberFirstcall = this.timeFormat(response.data[0].memberFirstcall);
                        response.data[0].memberLastcall = this.timeFormat(response.data[0].memberLastcall);
                        response.data[0].teamFirstcall = this.timeFormat(response.data[0].teamFirstcall);
                        response.data[0].teamLastcall = this.timeFormat(response.data[0].teamLastcall);
                        this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests":response.data[0].totalCallLog});
                        this.userCallInfo = response.data[0];
                        this.spinner.hide();
                      }
                      if(response.message === "Record not found"){
                        this.spinner.hide();
                        //this.showToast(response.message, "center");
                      }
                    },
                    err => {
                        console.log(err);
                        this.spinner.hide();
                    },
                    () => console.log('Get json Complete')
                );
            })
        }
     });    
  }

  timeFormat(changeTime){
    return changeTime.replace(/(\d{1,2})(.+)/, function(x, h, m) {
      h = parseInt(h, 10);  
      m = parseInt(m.split(":")[1]);
      var ampm = h > 11 ? 'PM' : 'AM';  
      if (h > 12) h = h - 12;  
      if (10 > h) h = '0' + h;
      if(10 > m) m = '0' + m;
      return h +':'+ m + ' ' + ampm;  
    });  
  }

  navigatePage(text){
    if(text == "settings"){
      this.navCtrl.push(SettingsPage);
    }else{
      this.navCtrl.push(ReportsPage);      
    }
  }

  toggle(){
    if(!this.showDetails){
      this.showDetails = true;
      this.icon = 'remove-circle';
    } else {
      this.icon = 'add-circle';
      this.showDetails = false;
    }
  }

  onSubmit(values){ 
    var customername = this.custname.getValue();
    var contactlocation = this.contact.getValue();
    var location = this.custlocation.getValue();
    var lat_long = this.shareService.getLatLong();
    // console.log(values, customername, location, contactlocation, this.userInfo.username, this.userInfo.phone);
    this.networkState = navigator.connection.type;
    if(this.networkState === 'none') {
      // console.log('offline');
      window.plugins.toast.show("Network connection is not available", "short", "center");
       let db = new SQLite();
          db.create({
              name: "cooper.db",
              location: "default"
          }).then((db: SQLiteObject) => {
                  db.executeSql("INSERT INTO customeraddlog" + 
                  "(customerName,contact,location,comment,orderValue,vibe,salesmanName,salesmanContact,lat,long) VALUES" +
                  "('"+customername+"','"+contactlocation+"','"+location+"','"+values.comment+"','"+values.order+"','"+values.vibe+"','"+this.userInfo.username+"','"+this.userInfo.phone+"', '"+lat_long.latitude+"', '"+lat_long.longitude+"')", []).then((data) => {
                  // console.log("INSERTED: " + JSON.stringify(data));
                  this.detailForm.reset();
                  this.custname.clearValue();
                  this.contact.clearValue();
                  this.custlocation.clearValue();
              }, (error) => {
                  console.log("ERROR: " + JSON.stringify(error));
              });
          }, (error) => {
              console.error("Unable to open database", error);
          });
      
    } else {
      // console.log('online');
      this.storage.get('apiCount').then((val) => {
         this.newdate = this.datepipe.transform(val.todaydate, 'dd-MMM-yyyy');
         this.count = val.noOfRequests;
      })
      if(customername && contactlocation && location && values) {
        values.customerName = customername;
        values.contact = contactlocation;
        values.location = location;
        values.salesmanName = this.userInfo.username;
        values.salesmanContact  = this.userInfo.phone;
        values.latitude = lat_long.latitude;
        values.longitude = lat_long.longitude;
        this.dataService.addCallLog(values).subscribe(
                  response => {
                    if(response.message === 'Record created successfully'){
                      this.showToast(response.message, "center");
                      var compareToday = this.datepipe.transform(new Date(), 'dd-MMM-yyyy')
                      if(this.newdate == compareToday) {
                        this.count++;
                        this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests":this.count});
                      } else {
                        this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests": 1});
                      }
                      this.detailForm.reset();
                      this.custname.clearValue();
                      this.contact.clearValue();
                      this.custlocation.clearValue();
                    }
                  },
                  err => {
                      console.log(err);
                      this.showToast("Record not created", "center");
                  },
                  () => console.log('Get json Complete')
              );
          }else{
            // console.log('else')
            if(!customername) {
              this.showToast("Please enter customername.", "center");
            } else if(!contactlocation) {
              this.showToast("Please enter contact location.", "center");
            } else {
              this.showToast("Please enter location.", "center");
            }
          }
      }
  }

  exitApplication(){
    this.platform.exitApp();
  }
  showToast(message, position) {
      this.platform.ready().then(() => {
          window.plugins.toast.show(message, "short", position);
      });
  }

}
