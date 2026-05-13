import express from 'express';
import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';
import Center from '../models/Center.js';
import Volunteer from '../models/Volunteer.js';
import Dispatch from '../models/Dispatch.js';
import User from '../models/User.js';
import { WAREHOUSE_LOCATION } from '../data.js';
import { findNearestVolunteer, calculateDistance, calculatePriorityScore } from '../lib/algorithms.js';
import { protect, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get assigned centers for volunteer
const getAssignedCenters = async (userId) => {
  const volunteer = await Volunteer.findOne({ userId });
  return volunteer ? volunteer.assignedCenters || [] : [];
};

// Calculate real-time dynamic center metrics 
const enrichCenterMetrics = (center) => {
  let totalRequired = 0;
  let totalAvailable = 0;
  const inv = center.inventory || [];

  // Dynamically fallback for dynamically generated centers missing basic requirements
  const reqResources = (center.requiredResources && center.requiredResources.length > 0)
    ? center.requiredResources
    : [
      { itemId: 'inv-001', quantity: Math.max(100, (center.peopleCount || 0) * 2) },
      { itemId: 'inv-002', quantity: Math.max(50, (center.peopleCount || 0)) }
    ];

  for (const reqItem of reqResources) {
    totalRequired += reqItem.quantity;
    const invMatch = inv.find(i => i.itemId === reqItem.itemId);
    if (invMatch) {
      totalAvailable += Math.min(invMatch.quantity, reqItem.quantity);
    }
  }
  let sLevel = center.shortageLevel;
  if (totalRequired > 0) {
    let ratio = (totalRequired - totalAvailable) / totalRequired;
    sLevel = Math.max(0, Math.round(ratio * 10));
  } else {
    sLevel = 0;
  }
  const pScore = calculatePriorityScore(center.peopleCount || 0, sLevel);

  // Convert to plain object safely handling mongoose documents
  const cObj = center.toObject ? center.toObject() : { ...center };
  delete cObj._id;
  delete cObj.__v;
  delete cObj.createdAt;
  delete cObj.updatedAt;

  cObj.requiredResources = reqResources;
  cObj.shortageLevel = sLevel;
  cObj.priorityScore = pScore;
  return cObj;
};

// =======================
// INIT SYNC
// =======================
router.get('/all', protect, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database not connected' });

    const role = req.user.role;
    let inventory = await Inventory.find({}, '-_id -__v -createdAt -updatedAt');
    let centers = [];
    let volunteers = [];
    let dispatches = [];

    if (role === 'admin') {
      const dbCenters = await Center.find({});
      centers = dbCenters.map(enrichCenterMetrics);
      volunteers = await Volunteer.find({}, '-_id -__v -createdAt -updatedAt');
      dispatches = await Dispatch.find({}, '-_id -__v -createdAt -updatedAt');
    } else if (role === 'volunteer') {
      const assignedCenters = await getAssignedCenters(req.user._id);
      const dbCenters = await Center.find({ id: { $in: assignedCenters } });
      centers = dbCenters.map(enrichCenterMetrics);
      dispatches = await Dispatch.find({ centerId: { $in: assignedCenters } }, '-_id -__v -createdAt -updatedAt');
      // A volunteer might only need to see themselves
      volunteers = await Volunteer.find({ userId: req.user._id }, '-_id -__v -createdAt -updatedAt');
    }

    res.json({ inventory, centers, volunteers, dispatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================
// INVENTORY ENDPOINTS
// =======================
router.get('/inventory', protect, async (req, res) => {
  try {
    const items = await Inventory.find({}, '-_id -__v -createdAt -updatedAt');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/inventory', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const newItem = await Inventory.create({
      ...req.body,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date()
    });
    const itemObj = newItem.toObject();
    delete itemObj._id;
    delete itemObj.__v;
    delete itemObj.createdAt;
    delete itemObj.updatedAt;
    res.status(201).json(itemObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/inventory/:id', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const updatedItem = await Inventory.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/inventory/:id', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const deleted = await Inventory.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =======================
// CENTERS ENDPOINTS
// =======================
router.get('/centers', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let centers = [];
    if (role === 'admin') {
      const dbCenters = await Center.find({});
      centers = dbCenters.map(enrichCenterMetrics);
    } else {
      const assignedCenters = await getAssignedCenters(req.user._id);
      const dbCenters = await Center.find({ id: { $in: assignedCenters } });
      centers = dbCenters.map(enrichCenterMetrics);
    }
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/centers', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const priorityScore = calculatePriorityScore(req.body.peopleCount || 0, req.body.shortageLevel || 0);
    const newCenter = await Center.create({
      ...req.body,
      requiredResources: req.body.requiredResources && req.body.requiredResources.length > 0
        ? req.body.requiredResources
        : [
          { itemId: 'inv-001', quantity: Math.max(100, (req.body.peopleCount || 0) * 2) },
          { itemId: 'inv-002', quantity: Math.max(50, (req.body.peopleCount || 0)) }
        ],
      id: `center-${Date.now()}`,
      priorityScore
    });
    const centerObj = newCenter.toObject();
    delete centerObj._id; delete centerObj.__v; delete centerObj.createdAt; delete centerObj.updatedAt;
    res.status(201).json(enrichCenterMetrics(centerObj));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/centers/:id/inventory', protect, async (req, res) => {
  try {
    const { inventory } = req.body;
    const center = await Center.findOne({ id: req.params.id });
    if (!center) return res.status(404).json({ error: 'Center not found' });

    if (req.user.role === 'volunteer') {
      const assignedCenters = await getAssignedCenters(req.user._id);
      if (!assignedCenters.includes(req.params.id)) {
        return res.status(403).json({ error: 'Forbidden. Not your assigned center.' });
      }
    }

    let totalRequired = 0;
    let totalAvailable = 0;

    const reqResources = (center.requiredResources && center.requiredResources.length > 0)
      ? center.requiredResources
      : [
        { itemId: 'inv-001', quantity: Math.max(100, (center.peopleCount || 0) * 2) },
        { itemId: 'inv-002', quantity: Math.max(50, (center.peopleCount || 0)) }
      ];

    for (const reqItem of reqResources) {
      totalRequired += reqItem.quantity;
      const invMatch = inventory.find(i => i.itemId === reqItem.itemId);
      if (invMatch) {
        totalAvailable += Math.min(invMatch.quantity, reqItem.quantity);
      }
    }

    let newShortageLevel = center.shortageLevel;
    if (totalRequired > 0) {
      let ratio = (totalRequired - totalAvailable) / totalRequired;
      newShortageLevel = Math.max(0, Math.round(ratio * 10));
    } else {
      newShortageLevel = 0;
    }

    const newPriorityScore = calculatePriorityScore(center.peopleCount || 0, newShortageLevel);

    const updatedCenter = await Center.findOneAndUpdate(
      { id: center.id },
      { inventory, shortageLevel: newShortageLevel, priorityScore: newPriorityScore },
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );
    res.json(updatedCenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/centers/:id', protect, authorizeRole('admin'), async (req, res) => {
  try {
    let updates = { ...req.body };
    if (updates.peopleCount !== undefined || updates.shortageLevel !== undefined) {
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

// End of inventory put route

router.delete('/centers/:id', protect, authorizeRole('admin'), async (req, res) => {
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
router.get('/volunteers', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const volunteers = await Volunteer.find({}, '-_id -__v -createdAt -updatedAt');
      res.json(volunteers);
    } else {
      const vol = await Volunteer.findOne({ userId: req.user._id }, '-_id -__v -createdAt -updatedAt');
      res.json(vol ? [vol] : []);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reassign relief centers
router.put('/volunteers/:id/centers', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const { assignedCenters } = req.body; // should be array of center IDs
    const updatedVolunteer = await Volunteer.findOneAndUpdate(
      { id: req.params.id },
      { assignedCenters },
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );
    if (!updatedVolunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/volunteers/:id', protect, authorizeRole('admin'), async (req, res) => {
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
router.get('/dispatches', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let dispatches = [];
    if (role === 'admin') {
      dispatches = await Dispatch.find({}, '-_id -__v -createdAt -updatedAt');
    } else {
      const assignedCenters = await getAssignedCenters(req.user._id);
      dispatches = await Dispatch.find({ centerId: { $in: assignedCenters } }, '-_id -__v -createdAt -updatedAt');
    }
    res.json(dispatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Volunteers request food OR Admins create dispatch
router.post('/dispatches', protect, async (req, res) => {
  try {
    const { centerId, items } = req.body;

    if (req.user.role === 'volunteer') {
      const assignedCenters = await getAssignedCenters(req.user._id);
      if (!assignedCenters.includes(centerId)) {
        return res.status(403).json({ error: 'Not permitted to request for this center' });
      }
    }

    const center = await Center.findOne({ id: centerId });
    if (!center) return res.status(404).json({ error: 'Center not found' });

    // Deduct inventory rules (we do this when dispatch is requested for simplicity)
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

    const volunteer = await Volunteer.findOne({ id: req.body.volunteerId || req.user.volunteerId });
    // Note: if user is admin and didn't specify volunteer, we fallback to logic.
    // If user is volunteer requesting, we assign them internally or put generic fallback.
    const routeDistance = calculateDistance(WAREHOUSE_LOCATION, center.location);

    const dispatch = await Dispatch.create({
      id: `dispatch-${Date.now()}`,
      centerId,
      centerName: center.name,
      items: dispatchItems,
      volunteerId: volunteer ? volunteer.id : 'unknown',
      volunteerName: volunteer ? volunteer.name : 'Unknown Volunteer',
      routeDistance,
      status: 'pending', // Pending Admin approval based on prompt
      timestamp: new Date(),
      estimatedArrival: new Date(Date.now() + routeDistance * 5 * 60000)
    });

    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { id: item.itemId },
        { $inc: { quantity: -item.quantity }, lastUpdated: new Date() }
      );
    }

    if (volunteer) {
      await Volunteer.findOneAndUpdate(
        { id: volunteer.id },
        { status: 'busy', assignedTask: `Delivering to ${center.name}` }
      );
    }

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

router.put('/dispatches/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const dispatchOrig = await Dispatch.findOne({ id: req.params.id });
    if (!dispatchOrig) return res.status(404).json({ error: 'Dispatch not found' });

    if (req.user.role === 'volunteer') {
      const assignedCenters = await getAssignedCenters(req.user._id);
      if (!assignedCenters.includes(dispatchOrig.centerId)) {
        return res.status(403).json({ error: 'Forbidden. Not your assigned center.' });
      }
      if (status !== 'delivered') {
        return res.status(403).json({ error: 'Volunteers can only mark as delivered' });
      }
    }

    const dispatch = await Dispatch.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    );

    if (status === 'delivered') {
      await Volunteer.findOneAndUpdate(
        { id: dispatch.volunteerId },
        { status: 'available', assignedTask: null }
      );

      // Deposit dispatch items into center inventory and recalculate shortage level dynamically
      const center = await Center.findOne({ id: dispatch.centerId });
      if (center) {
        let localInventory = [...(center.inventory || [])];
        for (const item of dispatch.items) {
          const existingIdx = localInventory.findIndex(i => i.itemId === item.itemId);
          if (existingIdx >= 0) {
            localInventory[existingIdx].quantity += item.quantity;
          } else {
            localInventory.push({ itemId: item.itemId, itemName: item.itemName, quantity: item.quantity });
          }
        }

        let totalRequired = 0;
        let totalAvailable = 0;
        for (const reqItem of (center.requiredResources || [])) {
          totalRequired += reqItem.quantity;
          const invMatch = localInventory.find(i => i.itemId === reqItem.itemId);
          if (invMatch) {
            totalAvailable += Math.min(invMatch.quantity, reqItem.quantity); // cap at needed
          }
        }

        let newShortageLevel = center.shortageLevel;
        if (totalRequired > 0) {
          let ratio = (totalRequired - totalAvailable) / totalRequired;
          newShortageLevel = Math.max(0, Math.round(ratio * 10)); // 0 to 10
        }

        const newPriorityScore = calculatePriorityScore(center.peopleCount || 0, newShortageLevel);
        await Center.findOneAndUpdate(
          { id: center.id },
          { inventory: localInventory, shortageLevel: newShortageLevel, priorityScore: newPriorityScore }
        );
      }
    }

    res.json(dispatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
