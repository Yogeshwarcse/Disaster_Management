import mongoose from 'mongoose';
import User from './models/User.js';
import Volunteer from './models/Volunteer.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/disaster-management');
        console.log('Connected');

        const user = await User.create({
            username: 'test_full_' + Date.now(),
            email: 'test_full_' + Date.now() + '@test.com',
            password: 'password123',
            role: 'volunteer'
        });

        // Simulate what auth.js does
        const volunteer = await Volunteer.create({
            id: `vol-${Date.now()}`,
            userId: user._id,
            name: 'test',
            email: user.email,
            phone: '123'
        });

        user.volunteerId = volunteer.id;
        await user.save();
        console.log('User created and updated:', user);

    } catch (err) {
        console.log('FAILED!');
        console.log('Name:', err.name);
        console.log('Message:', err.message);
        console.log('Stack:', err.stack);
    } finally {
        process.exit(0);
    }
}
run();
