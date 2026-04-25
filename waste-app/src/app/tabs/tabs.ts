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
      --background: transparent;
      --border: 0;
      left: 12px;
      right: 12px;
      bottom: calc(env(safe-area-inset-bottom) + 10px);
      width: calc(100% - 24px);
      min-height: 74px;
      padding: 8px;
      border: 1px solid rgba(36, 55, 89, 0.12);
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 249, 246, 0.92) 50%, rgba(239, 243, 255, 0.92) 100%);
      box-shadow: 0 -16px 38px rgba(16, 35, 63, 0.13);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      animation: dock-enter 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .tab-item {
      --color: #6a7689;
      --color-selected: #10233f;
      --padding-top: 4px;
      --padding-bottom: 4px;
      --ripple-color: transparent;
      min-height: 56px;
      border-radius: 18px;
      position: relative;
      transition: transform 0.22s ease, color 0.22s ease;

      .tab-icon-wrap {
        width: 38px;
        height: 38px;
        margin-bottom: 4px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.58);
        box-shadow: inset 0 0 0 1px rgba(36, 55, 89, 0.08);
        transition: background-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
      }

      ion-icon {
        font-size: 19px;
      }

      ion-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: none;
        transition: color 0.22s ease, opacity 0.22s ease;
      }

      .tab-indicator {
        width: 16px;
        height: 3px;
        margin-top: 5px;
        border-radius: 999px;
        background: transparent;
        transform: scaleX(0.35);
        transition: transform 0.22s ease, background-color 0.22s ease;
      }

      &.tab-selected {
        transform: translateY(-1px);

        .tab-icon-wrap {
          color: #ffffff;
          background: linear-gradient(135deg, #148f78 0%, #1e6bd6 100%);
          box-shadow: 0 14px 24px rgba(20, 143, 120, 0.24);
          transform: translateY(-2px);
        }

        ion-label {
          color: #10233f;
        }

        .tab-indicator {
          background: #f2a93b;
          transform: scaleX(1);
        }
      }
    }

    @keyframes dock-enter {
      from {
        opacity: 0;
        transform: translateY(18px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule]
})
export class TabsPage {}
