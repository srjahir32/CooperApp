import { Component } from '@angular/core';
import { Validators, FormGroup, FormControl} from '@angular/forms';
import { Sim } from '@ionic-native/sim';
import 'rxjs/add/operator/debounceTime';
import { Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DetailsPage } from '../details/details';
import textMask, {conformToMask} from 'angular2-text-mask';

declare var window: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  sampleForm: FormGroup;
  public phoneNumberMask = [/[0-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  constructor(public navCtrl: NavController, private storage: Storage, private platform: Platform, public sim: Sim) {
  }  
  ionViewWillLoad() {
    this.sampleForm = new FormGroup({
        username: new FormControl('', Validators.compose([
          Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z]+$'),
          Validators.minLength(5),
          Validators.maxLength(50),
          Validators.required
        ])),
        phone: new FormControl('', Validators.compose([
          // Validators.pattern('^\\d+$'),
          // Validators.pattern('^[0-9]+(-[0-9]+)+$'),
          // Validators.minLength(10),
          // Validators.maxLength(10),
          Validators.required
        ]))
      });

      this.sim.getSimInfo().then(
        (info) => {
          console.log(info);
          if(info.phoneNumber){
            if(info.phoneNumber.charAt(0) === '1')
            {
              info.phoneNumber = info.phoneNumber.substr(1);
            }
            var conformedPhoneNumber = conformToMask(
              info.phoneNumber,
              this.phoneNumberMask,
              {guide: false}
            )
            info.phoneNumber = conformedPhoneNumber.conformedValue;
            (<FormControl>this.sampleForm.controls['phone']).setValue(info.phoneNumber);
          }
        },
        (err) => {
          console.log('Unable to get sim info: ', err)
        }
      );    
      this.sim.hasReadPermission().then(
        (info) => console.log('Has permission: ', info)
      );

      this.sim.requestReadPermission().then(
        () => console.log('Permission granted'),
        () => console.log('Permission denied')
      );
      this.sampleForm.valueChanges
      .debounceTime(400)
      .subscribe(data => this.onValueChanged(data));
  }  

  onValueChanged(data?: any) {
    if (!this.sampleForm) { return; }
    const form = this.sampleForm;
    for (const field in this.formErrors) {
      // clear previous error message
      this.formErrors[field] = [];
      this.sampleForm[field] = '';
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
      (<FormControl>this.sampleForm.controls['phone']).setValue(maskNo.substr(0));   
    } else { 
      if(maskNo.charAt(0) === '1') {
          (<FormControl>this.sampleForm.controls['phone']).setValue(maskNo.substr(1));
      } else {
        (<FormControl>this.sampleForm.controls['phone']).setValue(maskNo);
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
    if(values){
      var phonenumber = values.phone;
      values.phone = phonenumber.replace(/[-_]/g, "");
      if(values.phone.length === 11) {
        values.phone = values.phone.slice(0, -1);
      }
      this.showToast("Logged in successfully!", "center");    
      values.buildno = "1.0.1";
      this.storage.set('user', values); 
      this.navCtrl.setRoot(DetailsPage);
      this.sampleForm.reset(); 
    }
  }
  showToast(message, position) {
      this.platform.ready().then(() => {
          window.plugins.toast.show(message, "short", position);
      });
  }
}
