import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.html',
  styles: [`
    :host {
      display: contents;
    }
    
    .custom-tab-bar {
      --background: white;
      --border: 0;
      height: 60px;
      padding-bottom: 8px;
    }
    
    .tab-item {
      --color: #999;
      --color-selected: #1D9E75;
      
      svg {
        width: 22px;
        height: 22px;
      }
      
      ion-label {
        font-size: 11px;
        font-weight: 500;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule]
})
export class TabsPage {}
