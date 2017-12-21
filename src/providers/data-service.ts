import {  DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppConfig } from '../providers/app-config';
import 'rxjs/add/operator/map';

/*
  Generated class for the DataService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
declare var google;
@Injectable()
export class DataService {
  constructor(private http: Http, private datepipe: DatePipe) {
    console.log('Hello DataService Provider');    
  }
  getData(previousDay, phone){
    if(this.datepipe.transform(previousDay, 'dd') < '10') {
      previousDay = this.datepipe.transform(previousDay, 'd-MMM-yyyy'); 
    } else {
      previousDay = this.datepipe.transform(previousDay, 'dd-MMM-yyyy');
    }
    var data = {
                "salesmanContact": phone, 
                "date": previousDay
              };    
    return this.http.post(AppConfig.API_URL+'get/gatcallbydate', data)
      .map(
        result =>
        {
          return result.json()
        });  
  }

  getReport(givenDate){
    if(this.datepipe.transform(givenDate, 'dd') < '10') {
      givenDate = this.datepipe.transform(givenDate, 'd-MMM-yyyy'); 
    } else {
      givenDate = this.datepipe.transform(givenDate, 'dd-MMM-yyyy');
    }
    return this.http.get(AppConfig.API_URL+'genrate_excel/'+ givenDate)
      .map(
        result =>
        {
          return result.json()
        });  
  }

  addCallLog(data){
    return this.http.post(AppConfig.API_URL+'add/addcalllog', data)
      .map(
        result =>
        {
          return result.json()
        });
  }

  getLocationPlace(lat,long){
      return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&key=AIzaSyCVDY0bjYJORzq9FFWC_LfjDPk3ktJnwaI')      
      .map(
        result =>
        {
          return result.json()
        });
  }

  getGeocoderPlace(lat,long){
      var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat,long);
        var request = {
          latLng: latlng
        };
        geocoder.geocode(request, function(data, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (data[0] != null) {  
              console.log('googleplace'+ data[0].formatted_address)
              return data[0].formatted_address;
            } else {
              alert("No address available");
            }
          }
        });
  }


}
