export class ShareService {  
  
    name: string;
    latitude: string;
    longitude: string;
 
    constructor() {
        this.name = '';
        this.latitude = '';
        this.longitude = '';
    }

    setUserName(name) {
        this.name = name;       
    }
  
    getUserName() {
        return this.name;
    }   

    setLatLong(lat,long){        
        this.latitude = lat;
        this.longitude = long;
    }

    getLatLong(){
        var data = {
            latitude: this.latitude,
            longitude: this.longitude
        }
        return  data;
    }

}