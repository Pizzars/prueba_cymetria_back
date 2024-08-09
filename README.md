# Proyecto de Autenticación

Este proyecto proporciona un servicio de autenticación simple utilizando Express y MySQL. A continuación se detallan los pasos para configurar la base de datos necesaria para el funcionamiento de la aplicación.

## Configuración de la Base de Datos

Para preparar la base de datos, sigue estos pasos:

1. **Crear la base de datos:**

   ```sql
   CREATE DATABASE data_test;
   USE data_test;

   CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL
   );
   ```

Descripción de la Tabla
La tabla users contiene la siguiente estructura:

id: Un identificador único para cada usuario. Se incrementa automáticamente.
username: El nombre de usuario del usuario. No puede ser nulo.
password: La contraseña del usuario, almacenada de manera cifrada. No puede ser nula.

**Requisitos**
MySQL
Node.js
Express
Otros paquetes necesarios (consulte el archivo package.json para más detalles).

## Instalación

Primero instala las dependencias:

```bash
npm install
```

Despues corre el proyecto:

```bash
npm start
#or
node index.js
```

Consulta los servicios en [http://localhost:4000](http://localhost:4000) en el buscador.
