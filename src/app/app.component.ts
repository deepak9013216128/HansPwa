import { Component, Input, OnInit, AfterViewInit, enableProdMode } from '@angular/core';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Router , NavigationEnd} from '@angular/router';
import {firebase} from '@firebase/app';
import {environment} from '../environments/environment';
import {  NotificationsService } from '../../src/app/notifications.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'hansWebApp';
  footer = true;

  toggled: boolean;
  socialInfo: string;
  routerUrl: string;
  isLogin = 'false';
  @Input() header = true;
  clickToggle = false;
  btnToggle;
  clickEvent: any;

  // tslint:disable-next-line: max-line-length
  constructor(private swUpdate: SwUpdate, public router: Router, public notificationService: NotificationsService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (window as any).gtag('page_view', event.urlAfterRedirects);
       }
    }
 );
  }

  async ngOnInit() {

    firebase.initializeApp(environment.firebase);
    await this.notificationService.init();

    if (environment.production) {
      if (window) {
        window.console.log = () => {};
      }
    }

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
          window.location.reload();
      });
    }
}

async ngAfterViewInit() {
    await this.notificationService.requestPermission();
}

   myFunction() {
   this.clickToggle = true;
  }
}
