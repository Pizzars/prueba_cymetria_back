const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Use CORS middleware

// Configurar conexión MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "user_data_test", // Cambia esto por tu usuario MySQL
  password: "1234567890", // Cambia esto por tu contraseña MySQL
  database: "data_test",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Conectado a la base de datos MySQL");
});

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Ruta para registrarse
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Usuario registrado con éxito" });
  });
});

// Ruta para autenticarse
app.post("/login", (req, res) => {
  // app.get("/login", (req, res) => {
  const { username, password } = req.body;
  //   const { username, password } = req.query;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username y password son requeridos" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  });
});

// Ruta de prueba (Hola Mundo)
app.get("/hola", (req, res) => {
  res.json({ message: "¡Hola Mundo!" });
});

// Ruta protegida (solo accesible para usuarios autenticados)
app.get("/consulta/:document", authenticateToken, async (req, res) => {
  const document = req.params.document;

  try {
    // Configuración para la consulta a la API externa
    const config = {
      method: "GET",
      url: `https://api.talentotech.cymetria.com/api/v1/blockchain/obtener-estudiantes-aprobados`,
      headers: {},
    };

    // Hacer la solicitud a la API externa
    const response = await axios(config);

    // Extraer solo los datos relevantes de la respuesta
    const data = response.data;

    if (data && data.estudiantes_aprobados) {
      const list = data.estudiantes_aprobados;
      if (list.length) {
        for (let i = 0; i < list.length; i++) {
          const student = list[i];
          if (student.estudiante.num_documento === document) {
            res.json(student);
            return;
          }
        }
        res.status(404).json({ error: "Documento no encontrado" });
      } else {
        res.status(404).json({ error: "No se encontraron resultados" });
      }
      return;
    }

    // Enviar la respuesta al cliente
    res.json(data);
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ error: "Error al consultar el documento" });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
