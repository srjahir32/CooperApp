import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';

declare var window: any;

@Injectable()
export class ShowToast {
    
    constructor(private platform: Platform) {
    }
   
    showToast(message) {
        this.platform.ready().then(() => {
            window.plugins.toast.show(message, "short", "center");
        });
    }
}