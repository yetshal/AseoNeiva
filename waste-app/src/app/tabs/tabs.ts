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
      --background: rgba(255, 255, 255, 0.95);
      --border: 0;
      height: 75px;
      padding-bottom: env(safe-area-inset-bottom);
      border-top: 1px solid rgba(0,0,0,0.03);
      backdrop-filter: blur(10px);
      box-shadow: 0 -4px 20px rgba(0,0,0,0.02);
    }
    
    .tab-item {
      --color: #94a3b8;
      --color-selected: #1D9E75;
      --padding-top: 12px;
      
      svg {
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
        transition: transform 0.3s ease;
      }

      &.tab-selected svg {
        transform: translateY(-2px);
      }
      
      ion-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule]
})
export class TabsPage {}
