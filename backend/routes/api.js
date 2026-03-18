import express from 'express';
import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';
import Center from '../models/Center.js';
import Volunteer from '../models/Volunteer.js';
import Dispatch from '../models/Dispatch.js';
import { WAREHOUSE_LOCATION } from '../data.js'; // Still need warehouse location
import { findNearestVolunteer, calculateDistance, calculatePriorityScore } from '../lib/algorithms.js';

const router = express.Router();

// In-memory storage fallback
let memoryInventory = [];
let memoryCenters = [];
let memoryVolunteers = [];
let memoryDispatches = [];

// Helper to check if DB is connected
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// =======================
// INVENTORY ENDPOINTS
// =======================
router.get('/inventory', async (req, res) => {
  try {
    if (isDbConnected()) {
      const items = await Inventory.find({}, '-_id -__v -createdAt -updatedAt');
      res.json(items);
    } else {
      // Fallback to memory storage
      res.json(memoryInventory);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    if (isDbConnected()) {
      const newItem = await Inventory.create({
        ...req.body,
        id: `inv-${Date.now()}`,
        lastUpdated: new Date()
      });
      // Remove mongoose specific fields for frontend compatibility
      const itemObj = newItem.toObject();
      delete itemObj._id;
      delete itemObj.__v;
      delete itemObj.createdAt;
      delete itemObj.updatedAt;
      res.status(201).json(itemObj);
    } else {
      // Fallback to memory storage
      const newItem = {
        ...req.body,
        id: `inv-${Date.now()}`,
        lastUpdated: new Date()
      };
      memoryInventory.push(newItem);
      res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const updatedItem = await Inventory.findOneAndUpdate(
        { id: req.params.id },
        { ...req.body, lastUpdated: new Date() },
        { new: true, select: '-_id -__v -createdAt -updatedAt' }
      );
      if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
      res.json(updatedItem);
    } else {
      // Fallback to memory storage
      const index = memoryInventory.findIndex(item => item.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Item not found' });
      memoryInventory[index] = { ...memoryInventory[index], ...req.body, lastUpdated: new Date() };
      res.json(memoryInventory[index]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const deleted = await Inventory.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Item not found' });
      res.json({ success: true });
    } else {
      // Fallback to memory storage
      const index = memoryInventory.findIndex(item => item.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Item not found' });
      memoryInventory.splice(index, 1);
      res.json({ success: true });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =======================
// CENTERS ENDPOINTS
// =======================
router.get('/centers', async (req, res) => {
  try {
    const centers = await Center.find({}, '-_id -__v -createdAt -updatedAt');
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/centers', async (req, res) => {
  try {
    const priorityScore = calculatePriorityScore(req.body.peopleCount || 0, req.body.shortageLevel || 0);
    const newCenter = await Center.create({
      ...req.body,
      id: `center-${Date.now()}`,
      priorityScore
    });
    const centerObj = newCenter.toObject();
    delete centerObj._id;
    delete centerObj.__v;
    delete centerObj.createdAt;
    delete centerObj.updatedAt;
    res.status(201).json(centerObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/centers/:id', async (req, res) => {
  try {
    // If peopleCount or shortageLevel is updated, recalculate priorityScore
    let updates = { ...req.body };
    if (updates.peopleCount !== undefined || updates.shortageLevel !== undefined) {
      // Fetch the current center first if we don't have both fields in the update
      const currentCenter = await Center.findOne({ id: req.params.id });
      if (!currentCenter) return res.status(404).json({ error: 'Center not found' });
      
      const pCount = updates.peopleCount !== undefined ? updates.peopleCount : currentCenter.peopleCount;
      const sLevel = updates.shortageLevel !== undefined ? updates.shortageLevel : currentCenter.shortageLevel;
      updates.priorityScore = calculatePriorityScore(pCount, sLevel);
    }

    const updatedCenter = await Center.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );
    if (!updatedCenter) return res.status(404).json({ error: 'Center not found' });
    res.json(updatedCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/centers/:id', async (req, res) => {
  try {
    const deleted = await Center.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Center not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =======================
// VOLUNTEERS ENDPOINTS
// =======================
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find({}, '-_id -__v -createdAt -updatedAt');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/volunteers', async (req, res) => {
  try {
    const newVolunteer = await Volunteer.create({
      ...req.body,
      id: `vol-${Date.now()}`
    });
    const volObj = newVolunteer.toObject();
    delete volObj._id;
    delete volObj.__v;
    delete volObj.createdAt;
    delete volObj.updatedAt;
    res.status(201).json(volObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/volunteers/:id', async (req, res) => {
  try {
    const updatedVolunteer = await Volunteer.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );
    if (!updatedVolunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =======================
// DISPATCHES ENDPOINTS
// =======================
router.get('/dispatches', async (req, res) => {
  try {
    const dispatches = await Dispatch.find({}, '-_id -__v -createdAt -updatedAt');
    res.json(dispatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dispatches', async (req, res) => {
  try {
    const { centerId, items } = req.body;
    const center = await Center.findOne({ id: centerId });
    if (!center) return res.status(404).json({ error: 'Center not found' });

    // Check inventory
    const inventoryItems = await Inventory.find({ id: { $in: items.map(i => i.itemId) } });
    const inventoryMap = new Map(inventoryItems.map(i => [i.id, i]));
    
    const dispatchItems = [];
    for (const item of items) {
      const invItem = inventoryMap.get(item.itemId);
      if (!invItem || invItem.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient ${invItem?.name || 'item'} in inventory` });
      }
      dispatchItems.push({
        itemId: item.itemId,
        itemName: invItem.name,
        quantity: item.quantity
      });
    }

    // Find nearest available volunteer
    const availableVolunteers = await Volunteer.find({ status: 'available' });
    if (availableVolunteers.length === 0) return res.status(400).json({ error: 'No available volunteers' });
    
    // We need to pass regular objects to findNearestVolunteer, not mongoose docs
    const volunteerDocs = availableVolunteers.map(v => v.toObject());
    const volunteer = findNearestVolunteer(volunteerDocs, center.location);
    if (!volunteer) return res.status(400).json({ error: 'Failed to find nearest volunteer' });

    const routeDistance = calculateDistance(WAREHOUSE_LOCATION, center.location);

    const dispatch = await Dispatch.create({
      id: `dispatch-${Date.now()}`,
      centerId,
      centerName: center.name,
      items: dispatchItems,
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      routeDistance,
      status: 'pending',
      timestamp: new Date(),
      estimatedArrival: new Date(Date.now() + routeDistance * 5 * 60000) // 5 mins per km
    });

    // Deduct inventory
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { id: item.itemId },
        { $inc: { quantity: -item.quantity }, lastUpdated: new Date() }
      );
    }

    // Mark volunteer busy
    await Volunteer.findOneAndUpdate(
      { id: volunteer.id },
      { status: 'busy', assignedTask: `Delivering to ${center.name}` }
    );

    const dispatchObj = dispatch.toObject();
    delete dispatchObj._id;
    delete dispatchObj.__v;
    delete dispatchObj.createdAt;
    delete dispatchObj.updatedAt;

    res.status(201).json(dispatchObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/dispatches/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const dispatch = await Dispatch.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );

    if (!dispatch) return res.status(404).json({ error: 'Dispatch not found' });

    if (status === 'delivered' || status === 'cancelled') {
      await Volunteer.findOneAndUpdate(
        { id: dispatch.volunteerId },
        { status: 'available', assignedTask: null }
      );
    }

    res.json(dispatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =======================
// INIT SYNC (Get all data at once)
// =======================
router.get('/all', async (req, res) => {
  try {
    if (isDbConnected()) {
      const [inventory, centers, volunteers, dispatches] = await Promise.all([
        Inventory.find({}, '-_id -__v -createdAt -updatedAt'),
        Center.find({}, '-_id -__v -createdAt -updatedAt'),
        Volunteer.find({}, '-_id -__v -createdAt -updatedAt'),
        Dispatch.find({}, '-_id -__v -createdAt -updatedAt')
      ]);

      res.json({
        inventory,
        centers,
        volunteers,
        dispatches
      });
    } else {
      // Fallback to memory storage
      res.json({
        inventory: memoryInventory,
        centers: memoryCenters,
        volunteers: memoryVolunteers,
        dispatches: memoryDispatches
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
