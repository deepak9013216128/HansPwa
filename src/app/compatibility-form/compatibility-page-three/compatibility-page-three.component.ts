import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  NgxNotificationService
} from 'ngx-kc-notification';
import {
  Router
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from '../../notifications.service';

import {
  MatDialog,
  MatDialogConfig,
} from '@angular/material/';
import { FourPageService } from '../four-page.service';
import { Profile } from '../profile';
export interface StateGroup {
  letter: string;
  names: string[];
}
export interface hd {
  group: string;
  mapping_id: number;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
  selector: 'app-compatibility-page-three',
  templateUrl: './compatibility-page-three.component.html',
  styleUrls: ['./compatibility-page-three.component.css']
})
export class CompatibilityPageThreeComponent implements OnInit {
  @ViewChild('otpModal', { static: false }) private otpModal: any;

  time = {
    hour: 13,
    minute: 30
  };
  PageThree: FormGroup;


  errors: string[] = [];
  authMobileNumberStatus = false;
  birthPlace;
  birthPlaceText;

  Occupation: string[] = ['Private Job', 'Business/Self-Employed', 'Govt. Job', 'Doctor', 'Teacher', 'Not Working', 'Not Alive'];

  // for only getting the autocomplete predictions
  autoComplete = {
    strictBounds: false,
    type: 'geocode',
    fields: ['name']
  };
  incomeCategories = ['0-2.5', '2.5-5', '5-7.5', '7.5-10', '10-15', '15-20', '20-25', '25-35', '35-50', '50-70', '70-100', '100+'];


  constructor(private http: HttpClient, public dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router,
              public notification: NotificationsService,
              public fourPageService: FourPageService,
              private ngxNotificationService: NgxNotificationService, private spinner: NgxSpinnerService) {
    this.PageThree = this._formBuilder.group({
      // tslint:disable-next-line: max-line-length
      BirthPlace: [''],
      BirthTime: [''],
      Gotra: [''],
      FoodChoice: [''],
      Mangalik: [''],
      FatherStatus: [''],
      MotherStatus: [''],
      FamilyIncome: ['', Validators.compose([Validators.max(999)])],
      Locality: ['']
    });
  }

  ngOnInit() {
    this.fourPageService.getListData.subscribe(
      () => {
        if (localStorage.getItem('getListId') && localStorage.getItem('getListLeadId')) {
          this.setFormThreeData(this.fourPageService.getProfile());
        }
      }
    );
    // set home town in birth place from facebook
    this.fourPageService.facebookHomeTownUpdated.subscribe(
      res => {
        if (res) {
          this.PageThree.patchValue({
            BirthPlace: res
          });
        }
      }
    );
  }

  skip() {
    this.fourPageService.form3Completed.emit(true);
    setTimeout(() => {
      this.analyticsEvent('Skipped through Four Page Registration Page Three');
    }, 100);
  }

  isValid(notificationStatus): boolean { // notification status -> whether to show error notification
    //   if (this.birthPlace == null || this.birthPlace === '') {
    //     if (notificationStatus === 1) {
    //       this.ngxNotificationService.error('Select A Valid Birth Place');
    //     }
    //     return false;
    // }
    if (!this.PageThree.value.FoodChoice) {
      if (notificationStatus === 1) {
        this.ngxNotificationService.error('Select A Valid Food Choice');
      }
      return false;
    } else if (!this.PageThree.value.FatherStatus) {
      if (notificationStatus === 1) {
        this.ngxNotificationService.error('Select A Valid Father Status');
      }
      return false;
    } else if (!this.PageThree.value.MotherStatus) {
      if (notificationStatus === 1) {
        this.ngxNotificationService.error('Select A Valid Mother Status');
      }
      return false;
    } else if (!this.PageThree.value.FamilyIncome || !this.PageThree.controls.FamilyIncome.valid) {
      if (notificationStatus === 1) {
        this.ngxNotificationService.error('Enter A Valid Family Income');
      }
      return false;
    } else {
      return true;
    }
  }


  firstStep() {
    console.log(this.PageThree.value);
    if (!this.fourPageService.getUserThrough() && this.isValid(1) === false) {
      this.fourPageService.form3Completed.emit(false);
      return;
    } else {
      if (this.PageThree.value.FamilyIncome === "100+") {
        this.PageThree.value.FamilyIncome = 100;
      }
      else {
        const a = this.PageThree.value.FamilyIncome.split('-');
        this.PageThree.patchValue({
          FamilyIncome: String((Number(a[0]) + Number(a[1])) / 2)
        });
      }

      if (localStorage.getItem('redParam') && localStorage.getItem('redParam') === 'pending_profile'
      && this.fourPageService.getUserThrough()) {
        const personalFormData = new FormData();
        const familyFormData = new FormData();

        personalFormData.append('id', localStorage.getItem('id') ? localStorage.getItem('id') : localStorage.getItem('getListId'));
        personalFormData.append('birth_place', this.PageThree.value.BirthPlace);
  
        if (this.PageThree.value.BirthTime) {
          personalFormData.append('birth_time', this.PageThree.value.BirthTime);
        }
        personalFormData.append('food_choice', this.PageThree.value.FoodChoice);
        personalFormData.append('manglik', this.PageThree.value.Mangalik ?
          this.PageThree.value.Mangalik === 'Don\'t Know' ? 'Anshik Manglik' : this.PageThree.value.Mangalik : '');
        personalFormData.append('gotra', this.PageThree.value.Gotra);

        personalFormData.append('is_lead', localStorage.getItem('getListLeadId'));
        personalFormData.append('identity_number', localStorage.getItem('getListIdentity'));
        personalFormData.append('temple_id', localStorage.getItem('getListTemple'));

        console.log('personal', personalFormData.get('birth_place'));

        return this.http.post('https://partner.hansmatrimony.com/api/updatePersonalDetails', personalFormData).subscribe(
          (response: any) => {
            if (response.updatePerosnalDetails_status === 'Y') {

                this.updateFormThreePersonalData(personalFormData);

                familyFormData.append('father_status', this.PageThree.value.FatherStatus !== 'Not Alive' ? 'Alive' : 'Not Alive');
                familyFormData.append('mother_status', this.PageThree.value.MotherStatus !== 'Not Alive' ? 'Alive' : 'Not Alive');
                if (this.PageThree.value.FatherStatus !== 'Not Alive') {
                familyFormData.append('occupation_father', this.PageThree.value.FatherStatus);
              }
                if (this.PageThree.value.MotherStatus !== 'Not Alive') {
                familyFormData.append('occupation_mother', this.PageThree.value.MotherStatus);
              }
                familyFormData.append('family_income', this.PageThree.value.FamilyIncome);
                familyFormData.append('locality', this.PageThree.value.Locality);
                familyFormData.append('is_lead', localStorage.getItem('getListLeadId'));
                familyFormData.append('identity_number', localStorage.getItem('getListIdentity'));
                familyFormData.append('temple_id', localStorage.getItem('getListTemple'));

                console.log('family', this.PageThree.value);

                return this.http.post('https://partner.hansmatrimony.com/api/updateFamilyDetails', familyFormData).subscribe(
                (response: any) => {

                  if (response.updateFamilyDetails_status === 'Y') {
                    this.updateFormThreeFamilyData(familyFormData);
                  } else {
                    this.fourPageService.form3Completed.emit(false);
                    this.spinner.hide();
                    this.ngxNotificationService.error(response.message);
                  }

                },
                err => {
                  this.fourPageService.form3Completed.emit(false);
                  this.spinner.hide();
                  this.ngxNotificationService.error('SomeThing Went Wrong,Please try again AfterSome time!');
                  console.log(err);
                }
              );
            } else {
              this.fourPageService.form3Completed.emit(false);
              this.spinner.hide();
              this.ngxNotificationService.error(response.message);
            }
          }, err => {
            this.fourPageService.form3Completed.emit(false);
            this.spinner.hide();
            this.ngxNotificationService.error('SomeThing Went Wrong,Please try again AfterSome time!');
            console.log(err);
          }
        );
      } else {

      const firststepdata = new FormData();
      firststepdata.append('id', localStorage.getItem('id') ? localStorage.getItem('id') : localStorage.getItem('getListId'));
      firststepdata.append('birth_place', this.PageThree.value.BirthPlace);

      if (this.PageThree.value.BirthTime) {
        firststepdata.append('birth_time', this.PageThree.value.BirthTime);
      }
      firststepdata.append('food_choice', this.PageThree.value.FoodChoice);
      firststepdata.append('manglik', this.PageThree.value.Mangalik ?
        this.PageThree.value.Mangalik === 'Don\'t Know' ? 'Anshik Manglik' : this.PageThree.value.Mangalik : '');
      firststepdata.append('gotra', this.PageThree.value.Gotra);

      firststepdata.append('father_status', this.PageThree.value.FatherStatus !== 'Not Alive' ? 'Alive' : 'Not Alive');
      firststepdata.append('mother_status', this.PageThree.value.MotherStatus !== 'Not Alive' ? 'Alive' : 'Not Alive');
      if (this.PageThree.value.FatherStatus !== 'Not Alive') {
        firststepdata.append('occupation_father', this.PageThree.value.FatherStatus);
      }
      if (this.PageThree.value.MotherStatus !== 'Not Alive') {
        firststepdata.append('occupation_mother', this.PageThree.value.MotherStatus);
      }
      firststepdata.append('family_income', this.PageThree.value.FamilyIncome);
      firststepdata.append('locality', this.PageThree.value.Locality);


      // tslint:disable-next-line: max-line-length
      return this.http.post('https://partner.hansmatrimony.com/api/formThreeProfile', firststepdata).subscribe((res: any) => {
        console.log('first', res);

        if (res.status === 1) {
          this.spinner.hide();

          if (this.fourPageService.getUserThrough()) {
            this.updateFormThreeData(firststepdata);
          } else {
            this.analyticsEvent('Four Page Registration Page Three');
          }
          // this.ngxNotificationService.success('Registered Successfully');
        } else {
          this.fourPageService.form3Completed.emit(false);
          this.spinner.hide();
          this.ngxNotificationService.error(res.message);
        }
      }, err => {
        this.fourPageService.form3Completed.emit(false);
        this.spinner.hide();
        this.ngxNotificationService.error('SomeThing Went Wrong,Please try again AfterSome time!');
        console.log(err);
      });
    }
    }

  }
  setValue(item: string) {
    let vals = item.split('-');
    if (vals[0] == "100+")
      return "Rs 1+ Crore per year";
    else
      return "Rs. " + vals[0] + " - " + vals[1] + " Lakhs per year"
  }

  analyticsEvent(event) {
    if (!this.fourPageService.getUserThrough()) {
      (window as any).ga('send', 'event', event, '', {
        hitCallback: () => {

          console.log('Tracking ' + event + ' successful');

        }

      });

      // gtag app + web
      (window as any).gtag('event', event, {
        event_callback: () => {
          console.log('Tracking gtag ' + event + ' successful');
        }
      });
    }

  }

  placeChanged(type) {
    if (type === 'birth') {
      const birthPlace: HTMLInputElement = document.querySelector('#birthPlace');
      setTimeout(() => {
        console.log(birthPlace.value);
        this.PageThree.patchValue({
          BirthPlace: birthPlace.value
        });
        this.analyticsEvent('Four Page Registration Page Three Birth Place Changed');
      }, 200);
    } else {
      const locality: HTMLInputElement = document.querySelector('#locality');
      setTimeout(() => {
        console.log(locality.value);
        this.PageThree.patchValue({
          Locality: locality.value
        });
        this.analyticsEvent('Four Page Registration Page Three Locality Changed');
      }, 500);
    }
  }

  // tslint:disable-next-line: no-shadowed-variable
  changed(element: any) {
    console.log(element);
    switch (element) {
      case 'bTime':
        this.analyticsEvent('Four Page Registration Page Birth Time Changed');
        break;
      case 'gotra':
        this.analyticsEvent('Four Page Registration Page Three Gotra Changed');
        break;
      case 'food':
        this.analyticsEvent('Four Page Registration Page Three Food Choice Changed');
        break;
      case 'manglik':
        this.analyticsEvent('Four Page Registration Page Three Manglik Status Changed');
        break;
      case 'fstatus':
        this.analyticsEvent('Four Page Registration Page Three Father Status Changed');
        break;
      case 'mstatus':
        this.analyticsEvent('Four Page Registration Page Three Mother Status Changed');
        break;
      case 'Fincome':
        this.analyticsEvent('Four Page Registration Page Three Family Income Changed');
        break;
      default:
        break;
    }
    if (!this.fourPageService.getUserThrough() && this.isValid(0) === false) {
      this.fourPageService.form3Completed.emit(false);
      return;
    } else {
      this.fourPageService.form3Completed.emit(true);
    }
  }

  updateFormThreeData(profileData: FormData) {
    this.fourPageService.profile.birthPlace = profileData.get('birth_place') ?
      profileData.get('birth_place').toString() : '';
    this.fourPageService.profile.birthTime = profileData.get('birth_time') ?
      profileData.get('birth_time').toString() : '';
    this.fourPageService.profile.gotra = profileData.get('gotra') ? profileData.get('gotra').toString() : '';
    this.fourPageService.profile.foodChoice = profileData.get('food_choice') ?
      profileData.get('food_choice').toString() : '';

    this.fourPageService.profile.manglik = profileData.get('manglik') ? profileData.get('manglik').toString()
      : '';
    this.fourPageService.profile.fatherStatus = profileData.get('father_status') ?
      profileData.get('father_status').toString() : '';

    this.fourPageService.profile.motherStatus = profileData.get('mother_status') ?
      profileData.get('mother_status').toString() : '';

    this.fourPageService.profile.family.occupation = profileData.get('occupation_father') ?
      profileData.get('occupation_father').toString() : 'Not Working';

    this.fourPageService.profile.family.occupation_mother = profileData.get('occupation_mother') ?
      profileData.get('occupation_mother').toString() : 'Not Working';

    this.fourPageService.profile.familyIncome = profileData.get('family_income') ?
      profileData.get('family_income').toString() : '';
    console.log(this.fourPageService.getProfile());
    this.fourPageService.profile.locality = profileData.get('locality') ?
      profileData.get('locality').toString() : '';
    console.log(this.fourPageService.getProfile());
  }

  updateFormThreePersonalData(profileData: FormData) {
    this.fourPageService.profile.birthPlace = profileData.get('birth_place') ?
      profileData.get('birth_place').toString() : '';
    this.fourPageService.profile.birthTime = profileData.get('birth_time') ?
      profileData.get('birth_time').toString() : '';

    this.fourPageService.profile.gotra = profileData.get('gotra') ? profileData.get('gotra').toString() : '';

    this.fourPageService.profile.foodChoice = profileData.get('food_choice') ?
      profileData.get('food_choice').toString() : '';

    this.fourPageService.profile.manglik = profileData.get('manglik') ? profileData.get('manglik').toString()
      : '';
    
    console.log(this.fourPageService.getProfile());
  }

  updateFormThreeFamilyData(profileData: FormData) {
    this.fourPageService.profile.fatherStatus = profileData.get('father_status') ?
      profileData.get('father_status').toString() : '';

    this.fourPageService.profile.motherStatus = profileData.get('mother_status') ?
      profileData.get('mother_status').toString() : '';

    this.fourPageService.profile.family.occupation = profileData.get('occupation_father') ?
      profileData.get('occupation_father').toString() : 'Not Working';

    this.fourPageService.profile.family.occupation_mother = profileData.get('occupation_mother') ?
      profileData.get('occupation_mother').toString() : 'Not Working';

    this.fourPageService.profile.familyIncome = profileData.get('family_income') ?
      profileData.get('family_income').toString() : '';

    this.fourPageService.profile.locality = profileData.get('locality') ?
      profileData.get('locality').toString() : '';

    console.log(this.fourPageService.getProfile());
  }

  

  setFormThreeData(userProfile: Profile) {
    console.log("look here hjhjh", userProfile);
    this.birthPlaceText = userProfile.birthPlace ? userProfile.birthPlace : '';
    this.PageThree.patchValue({
      BirthPlace: userProfile.birthPlace,
      BirthTime: userProfile.birthTime,
      Gotra: userProfile.gotra,
      FoodChoice: userProfile.foodChoice,
      Mangalik: userProfile.manglik,

      FatherStatus: userProfile.fatherStatus === 'Alive' ? (userProfile.family.occupation && this.Occupation.includes(userProfile.family.occupation) ?
        userProfile.family.occupation : 'Not Working') : 'Not Working',

      MotherStatus: userProfile.motherStatus === 'Alive' ? (userProfile.family.occupation_mother && this.Occupation.includes(userProfile.family.occupation_mother) ?
        userProfile.family.occupation_mother : 'Not Working') : 'Not Working',

      FamilyIncome: userProfile.familyIncome,
      Locality: userProfile.locality
    });
    console.log(this.PageThree.value)
  }
  // setValueStatussetValueStatus(userProfile: Profile, i: number) {
  //   if (i == 1) {
  //     if (userProfile.fatherStatus === 'Alive') {
  //       return (userProfile.family.occupation ? userProfile.family.occupation : userProfile.fatherStatus);
  //     }
  //     else return userProfile.fatherStatus;
  //   }
  //   if (i == 2) {
  //     if (userProfile.motherStatus === 'Alive') {
  //       return (userProfile.family.occupation_mother ? userProfile.family.occupation_mother : userProfile.motherStatus)
  //     }
  //     else return userProfile.motherStatus;
  //   }
  // }
}



