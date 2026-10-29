import express from 'express';
import { getVehicles, getVehicleById } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/:id', getVehicleById);

export default router;
