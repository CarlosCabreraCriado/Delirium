
export interface Evento { 
		
		nombreEvento: string,
		descripcionEvento: string,
		tipo: string,
		nombreSala: string,
		exp_equipo: number,
		nivel_equipo: number,
		localizacion_inmap: string,
		estadoControl: {
			estado: string,
			hechizo: number,
			tipoObjetivo: string,
			rng: number,
			rngEncadenado: boolean,
			critico: boolean
		}
		objetosGlobales:{
			objeto_id: number
			nombre: string
			asignacion_variable: string
		}[]
	}







