import express from 'express';
import cors from 'cors';
import sbsRoutes from './routes/sbs.routes.js'; 

// --- Configuración de CORS ---
// Esta es la URL de tu front-end en Vercel
const VERCEL_FRONTEND_URL = "https://sbs-dashboard-frontend.vercel.app";

const whitelist = [
  'http://localhost:5173',
  'http://localhost:3000', 
  VERCEL_FRONTEND_URL  
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite apps de la whitelist O si el origen es 'undefined' (ej. Postman)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
};
// --- Fin de la Configuración ---

const app = express();

// Railway te dará un puerto en 'process.env.PORT'
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors(corsOptions)); // <-- Usamos las opciones de CORS
app.use(express.json()); 

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('API del Scraper SBS está funcionando!');
});

// Usamos las rutas que definimos
app.use('/api/v1/sbs', sbsRoutes); 

// Arrancar el servidor
app.listen(PORT, () => {
  // Escucha en el puerto asignado por Railway (o 4000 en local)
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});