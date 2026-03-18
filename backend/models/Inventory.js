import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  threshold: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
