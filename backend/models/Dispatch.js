import mongoose from 'mongoose';

const dispatchItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const dispatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  centerId: { type: String, required: true },
  centerName: { type: String, required: true },
  items: [dispatchItemSchema],
  volunteerId: { type: String, required: true },
  volunteerName: { type: String, required: true },
  routeDistance: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in-transit', 'delivered', 'cancelled'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  estimatedArrival: { type: Date }
}, {
  timestamps: true
});

const Dispatch = mongoose.model('Dispatch', dispatchSchema);

export default Dispatch;
