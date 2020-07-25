# Delirium Oficial 

Bienvenido al desarrollo de Delirium, un juego de mesa de estilo RPG y role-play, que combina el estilo de juego tradicional con mecánicas innovadoras gracias al soporte digital.

## Setup basico de desarrollador:

Para poder contribuir al desarrollo de la aplicación de Delirium se debe utilizar el repositorio git oficial de Delirium. Para ello bebe de pertenecer al grupo de colaboradores mediante una invitación.

-Una vez disponga de permisos de colaborador, abra el repositorio en una carpeta de su equipo. Puede iniciar un repositorio desde la aplicación Git Kraken especificando la siguiente dirección:

https://github.com/CarlosCabreraCriado/Delirium.git


## Comandos importantes:

Para realizar tareas de desarrollo, es importante que tenga en cuenta los siguientes comandos disponibles:

 *Para introducir los comandos asegurese de que la dirección del CMD o Terminal esta apuntando a la carpeta donde ha inicializado el repositorio.

 	-Instalar las dependencias: (Solo es necesario hacerlo la primera vez)
 		npm install

 	-Iniciar el Servidor Angular: (Ejecutar este comando en una ventana independiente)
 		npm start

 	-Iniciar la aplicación con electron: (Ejecutar este comando en una ventana independiente)
 		npm run electron


## Configuración:

Es posible que para que el programa funcione correctamente tenga que realizar algunas configuraciones en los siguientes archivos:

 -En src/app/app.service.ts: 
 		Mantenga la variable ipRemota con el siguiente valor: 
 			public ipRemota: string= "http://www.carloscabreracriado.com";

 -En src/app/app.module.ts:
 		Mantenga la variable config con el siguiente valor:
 			const config: SocketIoConfig = { url: 'http://www.carloscabreracriado.com', options: {} };

 -En main.js:
 		Mantenga la variable DEBUG con el siguiente valor: 
 			const DEBUG = true;





