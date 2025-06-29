import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { LogregPageComponent } from './logreg-page/logreg-page.component';
import { ActionsPageComponent } from './actions-page/actions-page.component';
import { CommunityPageComponent } from './community-page/community-page.component';
import { EducationalContentDetailPageComponent } from './educational-content-detail-page/educational-content-detail-page.component';
import { GoalActivityDetailPageComponent } from './goal-activity-detail-page/goal-activity-detail-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { UserProfilePageComponent } from './user-profile-page/user-profile-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { CarbonDashboardPageComponent } from './carbon-dashboard-page/carbon-dashboard-page.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    AdminPageComponent,
    LogregPageComponent,
    ActionsPageComponent,
    CommunityPageComponent,
    EducationalContentDetailPageComponent,
    GoalActivityDetailPageComponent,
    ChatPageComponent,
    UserProfilePageComponent,
    UserPageComponent,
    CarbonDashboardPageComponent,
    
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
