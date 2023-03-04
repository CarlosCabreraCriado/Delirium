
export interface Eventos { 
	evento_id: string,
	nombre_evento: string, 
	categoria_evento: string,
	ordenes: [],
}

export interface OrdenCondicion { 
	ordenId: number,
	variable: string,
	valorVariable: number|string,
	operador: " >"|"<"|"=="|"!="|">="|"<=",
	tipoEncadenadoTrue: "evento"|"orden",
	encadenadoTrue: number,
	tipoEncadenadoFalse: "evento"|"orden",
	encadenadoFalse: number
}

export interface OrdenVariable { 
	ordenId: number,
	comando: "add"|"remove"|"modificar"|"suma"|"multiplica", 
	variableTarget: string, 
	valorNuevo: string | number, 
	valorOperador: number 
}

export interface OrdenMision { 
	ordenId: number,
	comando: "add"|"remove"|"completar"|"fallido"|"incrementar"|"disminuir", 
	mision_id: number,
	tarea_id: number
}

export interface OrdenTrigger { 
	ordenId: number,
	comando: "add"|"remove", 
	trigger_id: number,
	trigger: any
}

export interface OrdenDialogo { 
	ordenId: number,
	tipoDialogo: string,
	contenido: string[], 
	opciones: string[], 
	encadenadoId: number[], 
	tipoEncadenado: string[] 
}

export interface OrdenMultimedia { 
	ordenId: number,
	comando: "start"|"stop", 
	tipoMultimedia: "video"|"musica"|"sonido", 
	nombreAsset: string
}

export interface OrdenHechizo { 
	ordenId: number,
	comando: "lanzar", 
	hechizo_id: number, 
	objetivo: "all"|"allHeroes"|"allEnemigo"|"objetivoTurno"|"idEnemigo", 
	enemigoObjetivoId: number[]
	heroeObjetivoId: number[]
}

export interface OrdenLoot { 
	ordenId: number,
	comando: "generarLoot", 
	objetivo: "allHeroes"|"objetivoTurno", 
	oro: number,
	exp: number,
	objetos: LootObjeto[]
}

interface LootObjeto{
	generado: boolean,
	objetoId: number,
	probTipo: number[], //Array que corresponde a la probabilidad de [Arma,Armadura,consumible]
	probRareza: number[], //Array que corresponde a la probabilidad de [comun,raro,epico,legendario]
	nivelMax: number,
	nivelMin: number
}

export interface OrdenEnemigo { 
	ordenId: number,
	comando: "spawn"|"remove", 
	idEnemigo: number, 
	tipoEnemigo: string,
}

export interface OrdenTiempo { 
	ordenId: number,
	comando: "avanzar"|"retroceder"|"anochecer"|"amanecer", 
	dias: number
}

export interface OrdenMazmorra { 
	ordenId: number,
	comando: "iniciar"|"finalizar"|"openSala", 
	mazmorraId: number,
	salaOpenId: number
}

