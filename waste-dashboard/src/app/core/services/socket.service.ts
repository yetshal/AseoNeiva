import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private vehicleUpdateSubject = new Subject<any>();

  constructor() {
    this.socket = io(environment.apiUrl);
    
    this.socket.on('vehicle-moved-all', (data: any) => {
      this.vehicleUpdateSubject.next(data);
    });

    this.socket.on('connect', () => {
      console.log('Dashboard conectado a WebSockets');
    });
  }

  /**
   * Retorna un observable que emite cada vez que cualquier vehículo se mueve
   */
  getVehicleUpdates(): Observable<any> {
    return this.vehicleUpdateSubject.asObservable();
  }

  /**
   * Desconecta el socket (útil si se desea cerrar sesión)
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
