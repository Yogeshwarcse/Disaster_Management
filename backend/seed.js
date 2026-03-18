import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Inventory from './models/Inventory.js';
import Center from './models/Center.js';
import Volunteer from './models/Volunteer.js';
import Dispatch from './models/Dispatch.js';
import { initialInventory, initialCenters, initialVolunteers, initialDispatches } from './data.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Inventory.deleteMany();
    await Center.deleteMany();
    await Volunteer.deleteMany();
    await Dispatch.deleteMany();

    // Insert sample data
    await Inventory.insertMany(initialInventory);
    await Center.insertMany(initialCenters);
    await Volunteer.insertMany(initialVolunteers);
    await Dispatch.insertMany(initialDispatches);

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
