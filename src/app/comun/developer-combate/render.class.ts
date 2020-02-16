
export interface RenderMazmorra { 
		
		nombrePartida: string,
		nombreSala: string,
		turno: number,
		registroTurno: any,
		estadisticas: any,
		cuentaAcciones: number
		estadoControl: {
			estado: string,
			hechizo: number,
			tipoObjetivo: string,
			rng: number,
			rngEncadenado: boolean,
			critico: boolean,
		}
		objetivo: {
			enemigos: [],
			heroes: []
		}
		descripcionSala: string,
		dificultad: string,
		nivel_equipo: number,
		exp_equipo: number,
		localizacion_inmap: string,
		numHeroes: number,
		numEnemigos: number,
		salaActual: number,
		personaje: string,
		personajeIndex: number,
		heroes: {
			clase: string
			nombre: string
			vida: number
			estadisticas: {
				armadura: number,
				vitalidad: number,
				fuerza: number,
				intelecto: number,
				agilidad: number,
				precision: number,
				ferocidad: number,
				general: number
			}
			escudo: number
			recurso: number
			recursoEspecial: any,
			acciones: number,
			cargaUlti: number
			turno: boolean
			buff: {
				id: number,
				duracion: any,
				tipo: string,
				tipo2: string,
				stat_inc: any,
				origen: string,
				dano_t: number,
				heal_t: number,
				escudo_t: number,
				rng: number
			}[],
			oro: number,
			objetos: {
				objeto_id: number
				portador_nombre: string
				tipo: string
				equipado_estado: boolean
			}[],
			objetivo: boolean,
			objetivoAuxiliar: boolean,
			animacion: number,
			online: boolean
		}[]
		
		objetosGlobales:{
			objeto_id: number
			nombre: string
			asignacion_variable: string
		}[],
		enemigos: {
			nombre: string,
			enemigo_id: number,
			vida: number,
			escudo: number,
			acciones: number;
			agro: number[],
			turno: boolean,
			estadisticas: {
				armadura: number,
				vitalidad: number,
				fuerza: number,
				intelecto: number,
				precision: number,
				ferocidad: number,
				general: number
			},
			buff: {
				id: number,
				duracion: any,
				tipo: string,
				tipo2: string,
				stat_inc: any,
				origen: string,
				dano_t: number,
				heal_t: number,
				escudo_t: number,
				rng: number
			}[]
			hechizos: [],
			objetivo: boolean,
			objetivoAuxiliar: boolean,
			animacion: number
		}[]
		render: {
			barraAccion: {
				mensajeAccion: string 
				mostrar: boolean
				nombreTurno: string
				claseTurno: string
			}
			enemigoMuerto: any,
			heroeMuerto: any,
			objetivoPredefinido: {
				enemigos: [],
				heroes: []
			}
		}
	}







