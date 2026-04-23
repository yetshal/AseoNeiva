import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket: Socket;
  public vehiclePositions$ = new Subject<any>();

  constructor() {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket']
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('Conectado al servidor de tiempo real');
    });

    this.socket.on('vehicle-moved', (data) => {
      console.log('Vehículo movido:', data);
      this.vehiclePositions$.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de tiempo real');
    });
  }

  joinRouteRoom(routeId: string) {
    this.socket.emit('join-room', `route-${routeId}`);
  }

  leaveRouteRoom(routeId: string) {
    this.socket.emit('leave-room', `route-${routeId}`);
  }
}
