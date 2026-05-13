import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Volunteer from '../models/Volunteer.js';
import { protect, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                volunteerId: user.volunteerId,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        console.log('Register endpoint called')
        const { username, email, password, role, volunteerData } = req.body;

        const userExists = await User.findOne({ email });
        console.log('userExists checked')
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        console.log('Creating User...')
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'volunteer',
        });
        console.log('User created!')

        if (user.role === 'volunteer' && volunteerData) {
            console.log('Creating Volunteer...')
            const volunteer = await Volunteer.create({
                ...volunteerData,
                id: `vol-${Date.now()}`,
                userId: user._id
            });
            console.log('Volunteer created!')
            user.volunteerId = volunteer.id;
            await user.save();
            console.log('User saved with volunteerId!')
        }

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            volunteerId: user.volunteerId,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error.stack);
        res.status(400).json({ error: error.stack });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        volunteerId: req.user.volunteerId
    });
});

export default router;
