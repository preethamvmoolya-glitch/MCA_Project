const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
  cargoId: { type: String, required: true, unique: true },
  shipName: { type: String, required: true },
  arrivalDate: { type: Date, required: true },
  manifestDetails: { type: String },
  documentsValid: { type: Boolean, default: false },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Pending'], default: 'Pending' },
  status: { type: String, enum: ['Data Entry', 'Automated Risk Evaluation', 'Cargo Triage', 'Focused Inspection', 'Disposition'], default: 'Data Entry' },
  inspectionNotes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Cargo', cargoSchema);
