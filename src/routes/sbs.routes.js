import { Router } from 'express';
import { fetchRates } from '../controllers/sbs.controller.js';

const router = Router();

// Cuando alguien vaya a GET /api/v1/sbs/rates, se ejecutará el controlador 'fetchRates'
router.get('/rates', fetchRates);

export default router;