import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import { AppConfig } from '../providers/app-config';
import { ShareService } from '../providers/share-service';
import 'rxjs/add/operator/map'

/*
  Generated class for the AutoCompleteTextService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocationService implements AutoCompleteService {
  labelAttribute = "customerLocation";
  constructor(private http: Http, private shareService: ShareService) {
    console.log('Hello LocationtService Provider');
  }

  getResults(keyword:string) {
        var name = this.shareService.getUserName();      
        return this.http.get(AppConfig.API_URL+'getlocation/'+name)
        .map(
            result =>
            {
            var response = result.json();
            return response.data
                .filter(item => item.customerLocation.toLowerCase().startsWith(keyword.toLowerCase()) )
            }); 
  }
}
