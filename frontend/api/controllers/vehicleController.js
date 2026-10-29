import { Vehicles } from '../models/store.js';

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicles.find();
    return res.json({ vehicles });
  } catch (err) {
    console.error('getVehicles error:', err);
    return res.status(500).json({ error: 'Failed to fetch vehicles.' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicles.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    return res.json({ vehicle });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch vehicle.' });
  }
};
