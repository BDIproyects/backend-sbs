import express from 'express';
import cors from 'cors';
import sbsRoutes from './routes/sbs.routes.js'; 

// --- Configuración de CORS ---
const VERCEL_FRONTEND_URL = "https://sbs-dashboard-frontend.vercel.app";

const whitelist = [
  VERCEL_FRONTEND_URL,
  'http://localhost:5173', // Tu localhost de Vite
  'http://localhost:3000'  // Localhost de React
];

const corsOptions = {
  origin: function (origin, callback) {
    // Si el 'origin' está en nuestra lista blanca, o si no hay 'origin' (como Postman),
    // lo permitimos.
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Si el 'origin' es un subdominio de Vercel (ej. un 'preview deploy')
      if (origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        // Bloquear todos los demás
        callback(new Error('No permitido por CORS'));
      }
    }
  }
};
// --- Fin de la Configuración ---

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors(corsOptions)); // <-- Usamos las opciones de CORS
app.use(express.json()); 

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('API del Scraper SBS está funcionando!');
});

app.use('/api/v1/sbs', sbsRoutes); 

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});