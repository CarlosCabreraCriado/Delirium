
export const datosDefecto = {
    hechizos: {
        "id": 0,
        "nombre": "Hechizo Prueba",
        "descripcion": "Descripcion del hechizo",
        "categoria": "-",
        "tipo": "BASICO",
        "imagen_id": 229,
        "nivel": 1,
        "recurso": 0,
        "poder": 0,
        "distancia": 1,
        "objetivo": "EU",
        "tipo_daño": "Físico",
        "daño_dir": 0,
        "heal_dir": 0,
        "escudo_dir": 0,
        "daño_esc_AD": 0,
        "daño_esc_AP": 0,
        "heal_esc_AD": 0,
        "heal_esc_AP": 0,
        "escudo_esc_AD": 0,
        "escudo_esc_AP": 0,
        "mod_amenaza": 1,
        "buff_id": 0,
        "animacion_id": 1,
        "hech_encadenado_id": 0,
        "triggersHechizo": []
    },
    buff: {
        "nombre": "Buffo Prueba",
        "descripcion": "Descripcion de buff",
        "duracion": 1,
        "tipo": "BUFF",
        "imagen_id": 152,
        "tipo_daño": "-",
        "daño_t": 0,
        "heal_t": 20,
        "escudo_t": 0,
        "daño_esc_AD": 0,
        "daño_esc_AP": 0,
        "heal_esc_AD": 0,
        "heal_esc_AP": 0,
        "escudo_esc_AD": 0,
        "escudo_esc_AP": 0,
        "stat_inc": 0,
        "stat_inc_inicial": 0,
        "stat_inc_t": 0,
        "animacion_id": 0,
        "visible": true,
        "triggersBuff": []
    },
    animaciones: {
        "id": 0,
        "nombre": "Animación Prueba",
        "duracion": "1",
        "sonidos": [
            {
                "sonido_id": 1,
                "nombre": "Sonido 1",
                "delay": 0
            }
        ],
        "subanimaciones": [
            {
                "id": 1,
                "sprite_id": 1,
                "nombre": "SubAnimacion 1",
                "hue_filter": 0,
                "sepia": 0,
                "saturation": 0,
                "brillo": 0,
                "frame_ref": 5,
                "num_frames": 6,
                "duracion": "1",
                "delay": "0",
                "offset_x": 0,
                "offset_y": 0
            }
          ]
    },
    eventos: {
        "nombre": "Nuevo Evento",
        "descripcion": "Descripcion del evento",
        "categoria": "null",
        "ordenes": []
    },
    enemigos: {
        "nombre": "Nuevo enemigo",
        "familia": "Gnoll",
        "descripcion": "Descripción Enemigo",
        "nivel": 1,
        "estadisticas": {
            "armadura": 0,
            "vitalidad": 30,
            "resistencia_magica": 1,
            "AD": 1,
            "AP": 1,
            "critico": 1
        },
        "escalado": {
            "armadura_esc": 1,
            "vitalidad_esc": 1,
            "resistencia_magica_esc": 1,
            "AD_esc": 1,
            "AP_esc": 1,
            "critico_esc": 1
        },
        "hechizos": [1,2,3],
        "movimiento_base": 4,
        "alcance": 1,
        "perma_buff_id": [],
        "hechizos_id": 1,
        "imagen_id": 1
    },
    misiones: {
          "tipo": "Principal",
          "capitulo": 1,
          "epigrafe": 1,
          "titulo": "Misión Test",
          "descripcion": "Saludos forastero, antes de empezar tu aventura por Delirium es necesario que realices algunas tareas para aprender lo basico.",
          "nivel_recomendado": 1,
          "triggerMision": [],
          "objetivos": [
            {
              "texto": "Ve a la ciudad de lightower.",
              "tipoObjetivo": "Booleano",
              "cuentaMax": 1,
              "requerido": true,
              "triggerObjetivo": [
                null
              ],
              "id": 1
            },
            {
              "texto": "Mata 3 Gnoll",
              "tipoObjetivo": "Cuenta",
              "cuentaMax": 3,
              "requerido": true,
              "triggerObjetivo": [
                null
              ],
              "id": 2
            }
          ],
          "recompensas": {
            "oro": 10,
            "exp": 10,
            "oro_repeticion_mod": 0.5,
            "exp_repeticion_mod": 0.5,
            "equipo": [
              {
                "unico": true,
                "id_unico": 1,
                "nivel": 1,
                "bloquearTipo": "Pesada",
                "bloquearRareza": "Poco común",
                "bloquearPieza": "Pechera",
                "bloquearPerk": null
              }
            ],
            "consumibles": [
              {
                "id_consumible": 1,
                "cantidad": 2
              }
            ]
          }
        },
    equipo: {
        "buffo_pasivo": 0,
        "descripcion": "Armadura pesada",
        "estadisticas": {
            "armadura": 9,
            "resistencia_magica": 9,
            "vitalidad": 7,
            "AP": 6,
            "AD": 1,
            "critico": 1
        },
        "id": 1,
        "imagen_id": 1,
        "modificador": 0,
        "nombre": "Pechera Rudimentaria Pesada",
        "pieza": "Pechera",
        "rareza": "Común",
        "vinculadoEquipar": true,
        "vinculadoRecoger": true,
        "unico": true,
        "perk_id": 1,
        "tipo": "Pesada"
    },

    consumible: {
        "buff_id": 1,
        "descripcion": "Restarura 100pv",
        "id": 1,
        "nombre": "Pocion de vida",
        "max_stack": 3,
        "rareza": "Común",
        "modo": "Mazmorra",
        "tipo": "Miscelaneo",
        "imagen_id": 73
    },
} //Fin Datos Defento







