import { getSbsRates } from '../services/sbsScraper.service.js';

// Creamos un controlador para manejar la lógica de la petición
export const fetchRates = async (req, res) => {
  try {
    // Leemos la moneda desde el query string de la URL (?moneda=nacional)
    // Si no viene, por defecto es 'nacional'
    const { moneda } = req.query; // req.query captura los parámetros de la URL

    console.log(`Controlador: Recibida petición de tasas para ${moneda || 'nacional'}`);
    
    // Llamamos a nuestro servicio de scraping
    const data = await getSbsRates(moneda);

    // Si todo sale bien, devolvemos el JSON
    res.status(200).json(data);

  } catch (error) {
    // Si el scraper falla, enviamos un error 500
    console.error("Error en el controlador:", error.message);
    res.status(500).json({ message: "Error al obtener los datos de la SBS", error: error.message });
  }
};