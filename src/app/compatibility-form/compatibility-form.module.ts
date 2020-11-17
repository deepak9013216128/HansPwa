import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { CompatibilityFormComponent } from './compatibility-form.component';
import { CompatibilityPageTwoComponent } from './compatibility-page-two/compatibility-page-two.component';
import { CompatibilityPageThreeComponent } from './compatibility-page-three/compatibility-page-three.component';
import { CompatibilityPhotoComponent } from './compatibility-photo/compatibility-photo.component';
import { CompatibilityFormRoutingModule } from './compatibility-form-routing.module';
import { FourPageService } from './four-page.service';
import { CompatibilityPageFiveComponent } from './compatibility-page-five/compatibility-page-five.component';
import { FormsMessageDialogComponent } from './forms-message-dialog/forms-message-dialog.component';
import { CompatibilityVerifyComponent } from './compatibility-verify/compatibility-verify.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { RegisterWithComponent } from './register-with/register-with.component';
import { ChooseForComponent } from './choose-for/choose-for.component';
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Testimonials } from './testimonials/testimonials.component';
import { ChoiceListComponent } from '../choice-list/choice-list.component';
import { TestimonialCards } from './testimonials/testimonial-cards/testimonial-cards.component';
@NgModule({
  declarations: [
    CompatibilityFormComponent,
    CompatibilityPageTwoComponent,
    CompatibilityPageThreeComponent,
    CompatibilityPhotoComponent,
    CompatibilityPageFiveComponent,
    FormsMessageDialogComponent,
    CompatibilityVerifyComponent,
    ThankYouComponent,
    RegisterWithComponent,
    ChooseForComponent,
    Testimonials,
    ChoiceListComponent,
    TestimonialCards
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    CompatibilityFormRoutingModule,
    NgxMatIntlTelInputModule,
    CarouselModule
  ],
  providers: [
    FourPageService
  ],
  entryComponents: [
    FormsMessageDialogComponent,
    RegisterWithComponent,
    ChooseForComponent
  ]
})
export class CompatibilityFormModule { }
