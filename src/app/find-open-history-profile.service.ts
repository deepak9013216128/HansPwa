import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FindOpenHistoryProfileService {
  openItem;
  credits;
  constructor() { }

  setItem(item: any) {
    console.log(item);
    this.openItem = item;
  }
  setCredits(credits: any) {
    this.credits = credits;
  }
  getItem() {
    if (this.openItem) {
    return this.openItem;
    } else {
      return null;
    }
  }
  getCredits() {
    if (this.credits) {
    return this.credits;
    } else {
      return null;
    }
  }
}