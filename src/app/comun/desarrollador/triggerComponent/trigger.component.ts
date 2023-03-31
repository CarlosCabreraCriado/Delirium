
import { Component , Inject, ViewChild,  ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import {FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';

export interface DialogData {
  tipoDialogo: string;
  data: any;
}

@Component({
  selector: 'triggerComponent',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.sass']
})

export class TriggerComponent {

    private confirmation: boolean = false;
    private triggerActivo: any = {};

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
            this.triggerActivo["activador"]= {
                activador: val.activador,
                identificador: val.identificador
            }
			console.log(this.triggerActivo)
		});

		//Suscripcion de cambios formulario Condición Inicial:
		this.formCondicionInicial.valueChanges.subscribe((val) =>{
            this.triggerActivo["condicionInicial"]= {
                variable: val.variable,
                operador: val.operador,
                valorComparado: val.valorComparado,
                comandoCheck: val.comandoCheck,
                valorCheck: val.valorCheck
            }
			console.log(this.triggerActivo)
		});

		//Suscripcion de cambios formulario Operador PRE:
		this.formOperadorPre.valueChanges.subscribe((val) =>{
            this.triggerActivo["operadorPre"]= {
                activado: val.activado,
                comandoPre: val.comandoPre,
                valorOperacionPre: val.valorOperacionPre
            }
			console.log(this.triggerActivo)
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
			console.log(this.triggerActivo)
		});

    }//Fin OnInit

    reloadForm(){
        console.log("Recargando formulario")
        this.formActivador.patchValue(this.triggerActivo["activador"]);
        this.formCondicionInicial.patchValue(this.triggerActivo["condicionInicial"]);
        this.formOperadorPre.patchValue(this.triggerActivo["operadorPre"]);
        this.formContador.patchValue(this.triggerActivo["contador"]);
        this.formTriggerEvento.patchValue(this.triggerActivo["eventoTrigger"]);
    }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

    guardarTrigger(){
        console.log("Guardando Trigger...")
    }
    cancelarTrigger(){
        console.log("Cancelando Trigger...")
    }

}





