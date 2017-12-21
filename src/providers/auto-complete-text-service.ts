import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import { AppConfig } from '../providers/app-config';
import 'rxjs/add/operator/map'

/*
  Generated class for the AutoCompleteTextService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AutoCompleteTextService implements AutoCompleteService {
  labelAttribute = "customerName";
  constructor(private http: Http) {
    console.log('Hello AutoCompleteTextService Provider');
  }

  getResults(keyword:string) {
    return this.http.get(AppConfig.API_URL+'searchcust/'+keyword)
      .map(
        result =>
        {
          var response = result.json();
          if(response.data != undefined) {
            return response.data
              .filter(item => item.customerName.toLowerCase().startsWith(keyword.toLowerCase()) )
          } else {
            return [];
          }
        });    
  }
}
