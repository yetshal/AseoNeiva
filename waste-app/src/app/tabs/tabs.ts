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
      --background: rgba(255, 255, 255, 0.97);
      --border: 0;
      min-height: 76px;
      padding: 10px 14px calc(env(safe-area-inset-bottom) + 10px);
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
      box-shadow: 0 -10px 24px rgba(15, 23, 42, 0.06);
      animation: dock-enter 520ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .tab-item {
      --color: #6b7280;
      --color-selected: #0f6e56;
      --padding-top: 3px;
      --padding-bottom: 3px;
      --ripple-color: transparent;
      min-height: 56px;
      border-radius: 18px;
      position: relative;
      transition: transform 0.24s ease, color 0.24s ease;

      .tab-icon-wrap {
        width: 40px;
        height: 40px;
        margin-bottom: 4px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(241, 245, 249, 0.86);
        box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.10);
        transition: background-color 0.24s ease, transform 0.24s ease, box-shadow 0.24s ease, color 0.24s ease;
      }

      ion-icon {
        font-size: 20px;
      }

      ion-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.01em;
        text-transform: none;
        transition: color 0.24s ease, opacity 0.24s ease;
      }

      .tab-indicator {
        width: 18px;
        height: 3px;
        margin-top: 5px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0);
        transform: scaleX(0.35);
        transition: transform 0.24s ease, background-color 0.24s ease;
      }

      &.tab-selected {
        transform: translateY(-1px);

        .tab-icon-wrap {
          color: #ffffff;
          background: linear-gradient(135deg, #1D9E75 0%, #0f6e56 100%);
          box-shadow: 0 14px 24px rgba(29, 158, 117, 0.22);
          transform: translateY(-2px);
        }

        ion-label {
          color: #0f172a;
          font-weight: 800;
        }

        .tab-indicator {
          background: #1D9E75;
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
