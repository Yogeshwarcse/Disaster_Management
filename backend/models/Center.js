import mongoose from 'mongoose';

const requiredResourceSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const centerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  capacity: { type: Number, required: true },
  peopleCount: { type: Number, required: true },
  requiredResources: [requiredResourceSchema],
  shortageLevel: { type: Number, required: true },
  status: { type: String, enum: ['stable', 'active', 'critical'], default: 'active' },
  priorityScore: { type: Number, required: true }
}, {
  timestamps: true
});

const Center = mongoose.model('Center', centerSchema);

export default Center;
