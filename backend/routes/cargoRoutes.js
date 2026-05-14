const express = require('express');
const router = express.Router();
const Cargo = require('../models/Cargo');

// Get all cargo
router.get('/', async (req, res) => {
  try {
    const cargos = await Cargo.find().sort({ arrivalDate: -1 });
    res.json(cargos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new cargo entry (Step 1: Cargo Arrival & Data Entry)
router.post('/', async (req, res) => {
  const cargo = new Cargo(req.body);
  try {
    const newCargo = await cargo.save();
    res.status(201).json(newCargo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update cargo status and risk (Step 2, 3, 4, 5)
router.put('/:id', async (req, res) => {
  try {
    const updatedCargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCargo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// AI Simulation Route (Mocking the AI-driven Risk Detection Engine)
router.post('/:id/evaluate', async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ message: 'Cargo not found' });
    
    // Simulate AI logic
    let risk = 'Low';
    if (!cargo.documentsValid || cargo.manifestDetails.includes('Hazardous')) {
      risk = 'High';
    } else if (cargo.shipName.includes('Unknown')) {
      risk = 'Medium';
    }

    cargo.riskLevel = risk;
    cargo.status = 'Cargo Triage'; // Move to next step
    await cargo.save();

    res.json(cargo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
