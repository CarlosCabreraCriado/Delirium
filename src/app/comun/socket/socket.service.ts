
import { Injectable, Output, EventEmitter} from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subscription , Subject, BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

    //Emisor de eventos Socket:
	  @Output() emisorEventoSocket: EventEmitter<any> = new EventEmitter();

    //Recepción de eventos:
    public eventoSocket = this.socket.fromEvent<any>('eventoSocket');
    public salaSocket = this.socket.fromEvent<any>('configurarPartida');

    //****************************
    //    Constructor
    //****************************

    constructor(private socket: Socket) {

        //Conection Error:
        this.socket.ioSocket.on('connect_error', err =>{
            console.log("ERROR DE CONEXION SOCKET")
            if(err.message == "Authentication error"){
                this.emisorEventoSocket.emit({peticion: "authError"})
            }else{
                this.emisorEventoSocket.emit({peticion: "socketDesconectado"})
            }
        });

        //Conection Fallida:
        this.socket.ioSocket.on('connect_failed', err =>{
            console.error("CONEXION SOCKET FALLIDA")
            console.log(err)
        });

        //Desconectado:
        this.socket.ioSocket.on('disconnect', err =>{
            console.error("SE TE HA DESCONECTADO DEL SOCKET")
            console.log(err)
            this.emisorEventoSocket.emit({peticion: "socketDesconectado"})
        });

        //Conection Error:
        this.socket.ioSocket.on('error', err =>{
            console.log("ERROR: Se ha producido un error en el Socket de comunicaciones.")
            //console.log(err)
            this.emisorEventoSocket.emit({peticion: "socketDesconectado"})
        });

        //Connexion establecida:
        this.socket.ioSocket.on('connect', err =>{
            console.log("Socket conectado... Done");
            this.emisorEventoSocket.emit({peticion: "conectado"})
        });
    }

    //****************************
    //    Metodos
    //****************************

    conectarSocket(token:string){
        console.log("Enviando Token: "+token)
        this.socket.ioSocket['auth'] = { token: token }
        this.socket.connect();
    }

    enviarSocket(evento,data){
      console.warn("ENVIANDO: ",data)
      this.socket.emit(evento,data);
    }

    desconectar(){
      this.socket.disconnect();
    }

}

