import { Component } from '@angular/core';
import { Validators, FormGroup, FormControl} from '@angular/forms';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { DataService } from '../../providers/data-service';
import textMask, {conformToMask} from 'angular2-text-mask'; 
/**
 * Generated class for the Settings page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var window: any;
declare var navigator: any;
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers: [DataService]
})
export class SettingsPage {
  settingsForm: FormGroup;
  count: number;
  networkState: any;
  previousDay: any;
  public phoneNumberMask = [/[0-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private storage: Storage, 
              private platform: Platform,
              private dataService: DataService) {
    this.storage.ready().then(() => {
       // Or to get a key/value pair
       this.storage.get('user').then((val) => {         
         var conformedPhoneNumber = conformToMask(
            val.phone,
            this.phoneNumberMask,
            {guide: false}
          )
          val.phone = conformedPhoneNumber.conformedValue;
          this.settingsForm.setValue(val);
       });
       this.storage.get('apiCount').then((val) => {
         if(val) {
          this.count = val.noOfRequests;
         } else {
           this.count = 0;
           this.storage.set('apiCount', {"todaydate":new Date(), "noOfRequests":0});
         }
       })
     });
  }
ionViewWillLoad() {
  this.settingsForm = new FormGroup({
        username: new FormControl('', Validators.compose([
          Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z]+$'),
          Validators.minLength(5),
          Validators.maxLength(50),
          Validators.required
        ])),
        phone: new FormControl('', Validators.compose([
          // Validators.pattern('^\\d+$'),
          // Validators.pattern('^[0-9]+(-[0-9]+)+$'),
          // Validators.minLength(12),
          // Validators.maxLength(12),
          Validators.required
        ])),
        buildno: new FormControl('')
      });

      this.settingsForm.valueChanges
      .debounceTime(400)
      .subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.settingsForm) { return; }
    const form = this.settingsForm;
    for (const field in this.formErrors) {
      // clear previous error message
      this.formErrors[field] = [];
      this.settingsForm[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field].push(messages[key]);
        }
      }
    }
    var maskNo = data.phone;
    if(maskNo.charAt(0) === '1' && maskNo.charAt(1) === '1') {
      (<FormControl>this.settingsForm.controls['phone']).setValue(maskNo.substr(0));   
    } else { 
      if(maskNo.charAt(0) === '1') {
          (<FormControl>this.settingsForm.controls['phone']).setValue(maskNo.substr(1));
      } else {
        (<FormControl>this.settingsForm.controls['phone']).setValue(maskNo);
      }
    } 
  }

  formErrors = {
    'username': [],
    'phone': []
  };

  validationMessages = {
    'username': {
      'required':      'Username is required.',
      'minlength':     'Username must be at least 5 characters long.',
      'maxlength':     'Username cannot be more than 50 characters long.',
      'pattern':       'Your username must contain only letters.',
    },    
    'phone': {
      'required':      'Phonenumber is required.',
      // 'minlength':     'Phonenumber must contain 10 digits.',
      // 'maxlength':     'Phonenumber cannot be more than 10 digits.',
      // 'pattern':       'Enter more digits.',
    }
  };
  
  onSubmit(values){
    // console.log(values)
    var phonenumber = values.phone;
    values.phone = phonenumber.replace(/[-_]/g, "");
    if(values.phone.length === 11) {
        values.phone = values.phone.slice(0, -1);
    }
    this.storage.set('user', values); 
    this.getcallLog();
    this.showToast("Updated successfully!", "center");
  }
  getcallLog(){
    this.storage.ready().then(() => {
      this.networkState = navigator.connection.type;
        // console.log(networkState)
      if(this.networkState === 'none') {
        window.plugins.toast.show("No internet connection", "short", "center");
      } else {
          this.storage.get('user').then((val) => {
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
                        this.count = response.data[0].totalCallLog;
                        this.storage.set('apiCount', {"todaydate":new Date(),"noOfRequests":response.data[0].totalCallLog}); 
                      }
                      if(response.message === "Record not found"){                       
                        this.showToast(response.message, "center");
                      }
                    },
                    err => {
                        console.log(err)
                    },
                    () => console.log('Get json Complete')
                );
            })
        }
     });    
  }

  logout(){
    this.storage.clear();
    this.showToast("Logged out successfully!", "center");
    this.navCtrl.setRoot(HomePage);
  }

  showToast(message, position) {
      this.platform.ready().then(() => {
          window.plugins.toast.show(message, "short", position);
      });
  }

}
