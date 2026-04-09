import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { HomePage } from '../home/home.page';
import { MapPage } from '../pages/map/map.page';
import { ReportPage } from '../pages/report/report.page';
import { ProfilePage } from '../pages/profile/profile.page';
import { TabsPage } from './tabs';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        component: HomePage
      },
      {
        path: 'map',
        component: MapPage
      },
      {
        path: 'report',
        component: ReportPage
      },
      {
        path: 'profile',
        component: ProfilePage
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})
export class TabsPageRoutingModule {}
