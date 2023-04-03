
import { Component , Inject, ViewChild,  ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import {FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';

export interface DialogData {
  tipoDialogo: string;
  data: any;
}

type Selector = {
    tipo: string,
    index: number
}

@Component({
  selector: 'triggerComponent',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.sass']
})

export class TriggerComponent {

    private confirmation: boolean = false;
    private triggers: any = [];
    private triggerActivo: any = {};
    private indexTriggerSeleccionado = 0;

    //Form Group:
  	private formActivador: FormGroup;
  	private formCondicionInicial: FormGroup;
  	private formOperadorPre: FormGroup;
  	private formContador: FormGroup;
  	private formTriggerEvento: FormGroup;

    //Campos Activador:
    private activador = new FormControl('???');
    private identificador = new FormControl('???');

    //Campos Condicion Inicial:
    private activadoCondicionInicial = new FormControl(false);
    private variableCondicionInicial = new FormControl('variable')
    private operadorCondicionInicial = new FormControl('=')
    private valorComparadoCondicionInicial = new FormControl('')
    private comandoCheckCondicionInicial = new FormControl('')
    private valorCheckCondicionInicial = new FormControl('')

    //Campos Operador PRE:
    private activadoOperadorPre = new FormControl(false);
    private comandoOperadorPre = new FormControl('addVar')
    private valorOperacionPre = new FormControl('')

    //Campos Contador:
    private activadoContador = new FormControl(false);
    private variableContador = new FormControl('variable')
    private operadorContador = new FormControl('=')
    private valorComparadoContador = new FormControl('')
    private comandoTrueContador = new FormControl('addVar')
    private valorOperacionTrueContador = new FormControl('variable')
    private comandoFalseContador = new FormControl('addVar')
    private valorOperacionFalseContador = new FormControl('variable')

    //Campos Evento Trigger:
    private eventoTriggerTrue = new FormControl(0);
    private eventoTriggerFalse = new FormControl(0)

    constructor(public dialogRef: MatDialogRef<TriggerComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private formBuilder: FormBuilder) { }

	async ngOnInit(){

        //Inicializacíón de los Trigger:
        this.triggers = this.data;
        console.log("Abriendo Triggers: ")
        console.log(this.triggers)


		//Inicializacion formulario Activador:
	    this.formActivador = this.formBuilder.group({
            activador: this.activador,
            identificador: this.identificador
	    });

		//Inicializacion formulario Activador:
	    this.formCondicionInicial = this.formBuilder.group({
            activado: this.activadoCondicionInicial,
            variable: this.variableCondicionInicial,
            operador: this.operadorCondicionInicial,
            valorComparado: this.valorComparadoCondicionInicial,
            comandoCheck: this.comandoCheckCondicionInicial,
            valorCheck: this.valorCheckCondicionInicial
	    });

		//Inicializacion formulario Operador Pre:
	    this.formOperadorPre = this.formBuilder.group({
            activado: this.activadoOperadorPre,
            comandoPre: this.comandoOperadorPre,
            valorOperacionPre: this.valorOperacionPre
	    });

		//Inicializacion formulario Activador:
	    this.formContador = this.formBuilder.group({
            activado: this.activadoContador,
            variable: this.variableContador,
            operador: this.operadorContador,
            valorComparado: this.valorComparadoContador,
            condicionTrue: this.formBuilder.group({
                comando: this.comandoTrueContador,
                valorOperacion: this.valorOperacionTrueContador
            }),
            condicionFalse: this.formBuilder.group({
                comando: this.comandoFalseContador,
                valorOperacion: this.valorOperacionFalseContador
            })
	    });

		//Inicializacion formulario Trigger Evento:
	    this.formTriggerEvento = this.formBuilder.group({
            eventoTriggerTrue: this.eventoTriggerTrue,
            eventoTriggerFalse: this.eventoTriggerFalse
	    });

		//Suscripcion de cambios formulario Activador:
		this.formActivador.valueChanges.subscribe((val) =>{
            this.triggerActivo["activador"]= val.activador;
            this.triggerActivo["identificador"]= val.identificador;
        });

		//Suscripcion de cambios formulario Condición Inicial:
		this.formCondicionInicial.valueChanges.subscribe((val) =>{
            this.triggerActivo["condicionInicial"]= {
                activado: val.activado,
                variable: val.variable,
                operador: val.operador,
                valorComparado: val.valorComparado,
                comandoCheck: val.comandoCheck,
                valorCheck: val.valorCheck
            }
		});

		//Suscripcion de cambios formulario Operador PRE:
		this.formOperadorPre.valueChanges.subscribe((val) =>{
            this.triggerActivo["operadorPre"]= {
                activado: val.activado,
                comandoPre: val.comandoPre,
                valorOperacionPre: val.valorOperacionPre
            }
		});

		//Suscripcion de cambios formulario Operador PRE:
		this.formContador.valueChanges.subscribe((val) =>{
            console.log(val)
            this.triggerActivo["contador"]= {
                activado: val.activado,
                variable: val.variable,
                operador: val.operador,
                valorComparado: val.valorComparado,
                condicionTrue: {
                    comando: val.condicionTrue.comando,
                    valorOperacion: val.condicionTrue.valorOperacion
                },
                condicionFalse: {
                    comando: val.condicionFalse.comando,
                    valorOperacion: val.condicionFalse.valorOperacion
                }
            }
		});

		//Suscripcion de cambios formulario Evento Trigger:
		this.formTriggerEvento.valueChanges.subscribe((val) =>{
            console.log(val)
            this.triggerActivo["triggerEvento"]= {
                eventoTriggerTrue: val.eventoTriggerTrue,
                eventoTriggerFalse: val.eventoTriggerFalse
            }
		});

        //Seleccionar Primer Trigger:
        if(this.triggers.length == 0){
            this.triggerActivo = null;
            this.indexTriggerSeleccionado = -1;
        }else{
            this.triggerActivo = this.triggers[0];
            this.indexTriggerSeleccionado = 0;
            this.reloadForm();
        }

    }//Fin OnInit

    reloadForm(){
        console.log("Recargando formulario")
        console.log(this.triggerActivo)

        this.formActivador.patchValue({
            activador: this.triggerActivo["activador"],
            identificador: this.triggerActivo["identificador"],
        });
        this.formCondicionInicial.patchValue(this.triggerActivo["condicionInicial"]);
        this.formOperadorPre.patchValue(this.triggerActivo["operadorPre"]);
        this.formContador.patchValue(this.triggerActivo["contador"]);
        this.formTriggerEvento.patchValue(this.triggerActivo["triggerEvento"]);
    }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

    guardarTrigger(){
        console.log("Guardando Trigger...")
        this.dialogRef.close(this.triggers);
    }
    cancelarTrigger(){
        console.log("Cancelando Trigger...")
        this.dialogRef.close(false);
    }

    seleccionarTrigger(event: Selector){
        console.log("Trigger Seleccionado: ")

        //Guarda la seleccion anterior si el activo no es null.
        if(this.triggerActivo){
            console.log("Guardando Trigger Antiguo: "+this.indexTriggerSeleccionado)
            this.triggers[this.indexTriggerSeleccionado] = Object.assign({},this.triggerActivo);
        }

        this.indexTriggerSeleccionado = event.index;
        this.triggerActivo = this.triggers[event.index];

        console.log("TRIGGERS: ")
        console.log(this.triggers);
        this.reloadForm();
    }

    addTrigger(){
        console.log(this.triggers)
        this.triggers.push({
            activador: null,
            identificador: "Nuevo Trigger", 
            condicionInicial: {
                activado: false,
                variable: null,
                operador: null,
                valorComparado: null,
                comandoCheck: null,
                valorCheck: null 
            },
            operadorPre: {
                activado: false, 
                comandoPre: null, 
                valorOperacionPre: null
            },
            contador: {
                activado: false,
                variable: null, 
                operador: null, 
                valorComparado: null,
                condicionTrue: {
                    comando: null,
                    valorOperacion: null 
                },
                condicionFalse: {
                    comando: null,
                    valorOperacion: null 
                }
            },
            triggerEvento: {
                eventoTriggerTrue: null, 
                eventoTriggerFalse: null 
            }
        }) //Fin Push

        var selector = {
            tipo: "Triggers",
            index: this.triggers.length-1
        }

        //Seleccionar El Nuevo Trigger:
        this.seleccionarTrigger(selector);

    }//Fin AddTrigger

    eliminarTrigger(){
        console.log("Eliminando Trigger: " + this.indexTriggerSeleccionado)
        this.triggers.splice(this.indexTriggerSeleccionado,1);
        this.indexTriggerSeleccionado = -1;
        this.triggerActivo = null 
    }

}





