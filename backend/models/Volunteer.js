import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  },
  assignedTask: { type: String, default: null },
  skills: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedCenters: [{ type: String }] // Array of center IDs
}, {
  timestamps: true
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
