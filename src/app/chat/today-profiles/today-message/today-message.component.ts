import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionserviceService } from 'src/app/subscriptionservice.service';
import { FindOpenHistoryProfileService } from 'src/app/find-open-history-profile.service';

@Component({
  selector: 'app-today-message',
  templateUrl: './today-message.component.html',
  styleUrls: ['./today-message.component.css']
})
export class TodayMessageComponent implements OnInit {
@Input() messageData;
@Input() button = '0';
  constructor(public router: Router,
              public itemService: FindOpenHistoryProfileService,
              public subscriptionService: SubscriptionserviceService ) {
              }

  ngOnInit() {
  }
    callHans() {
      window.open('tel:9697989697');
    }
    getMessage() {
      console.log(this.messageData, this.button);
      return this.messageData;
    }
    showPlan() {
    this.router.navigateByUrl('subscription');
    }
    showLikedProfile() {
      this.itemService.changeTab(2);
    }
    showProfilesLikedMe() {
      this.itemService.changeTab(3);
    }
    goToVip() {
      this.itemService.changeTab(4);
    }
    buyPlan(plan: any) {
      this.router.navigateByUrl('subscription');
    }

}
