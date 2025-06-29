import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarbonDashboardPageComponent } from './carbon-dashboard-page/carbon-dashboard-page.component';
import { ActionsPageComponent } from './actions-page/actions-page.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { CommunityPageComponent } from './community-page/community-page.component';
import { EducationalContentDetailPageComponent } from './educational-content-detail-page/educational-content-detail-page.component';
import { GoalActivityDetailPageComponent } from './goal-activity-detail-page/goal-activity-detail-page.component';
import { LogregPageComponent } from './logreg-page/logreg-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { UserProfilePageComponent } from './user-profile-page/user-profile-page.component';

const routes: Routes = [
  {path: '',component:CarbonDashboardPageComponent},
  {path: 'actions-page',component:ActionsPageComponent},
  {path: 'admin-page',component:AdminPageComponent},
  {path: 'carbon-dashboard-page',component:CarbonDashboardPageComponent},
  {path: 'chat-page',component:ChatPageComponent},
  {path: 'community-page',component:CommunityPageComponent}, 
  {path: 'educational-content-detail-page',component:EducationalContentDetailPageComponent},
  {path: 'goal-activity-detail-page',component:GoalActivityDetailPageComponent},
  {path: 'logreg-page',component:LogregPageComponent},
  {path: 'user-page',component:UserPageComponent},
  {path: 'user-profile-page',component:UserProfilePageComponent},
  {path: 'educational-content-detail-page/:id', component:EducationalContentDetailPageComponent },
  {path: 'goal-activity-detail-page/:id', component:GoalActivityDetailPageComponent },
  {path: 'user-page/:username', component:UserPageComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
