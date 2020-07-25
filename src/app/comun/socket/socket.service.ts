
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subscription , Subject, BehaviorSubject} from 'rxjs';
import { AppService } from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

    public eventoSocket = this.socket.fromEvent<any>('eventoSocket');
    public salaSocket = this.socket.fromEvent<any>('configurarPartida');

    //****************************
    //    Constructor
    //****************************

    constructor(private socket: Socket, private appService: AppService) {}

    //****************************
    //    Metodos
    //****************************
    
    configurarPartida(data){
       console.log("Configurando partida: ");
       console.log(data);
    }

    enviarSocket(evento,data){
      this.socket.emit(evento,data);
    }

}

