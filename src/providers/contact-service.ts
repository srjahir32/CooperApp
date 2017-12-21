import { AutoCompleteService } from 'ionic2-auto-complete';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppConfig } from '../providers/app-config';
import { ShareService } from '../providers/share-service';
import 'rxjs/add/operator/map';

/*
  Generated class for the ContactService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ContactService {
  labelAttribute = "customerContact";
  constructor(public http: Http, private shareService: ShareService) {
    console.log('Hello ContactService Provider');
  }

  getResults(keyword:string) {
        var name = this.shareService.getUserName();
        return this.http.get(AppConfig.API_URL+'getContact/'+name)
        .map(
            result =>
            {
            var response = result.json();
            return response.data
                .filter(item => item.customerContact.toLowerCase().startsWith(keyword.toLowerCase()) )
            }); 
  }

}
