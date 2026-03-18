import { calculatePriorityScore } from './lib/algorithms.js'

export const WAREHOUSE_LOCATION = {
  lat: 37.7749,
  lng: -122.4194
}

export const initialInventory = [
  {
    id: 'inv-001',
    name: 'Bottled Water',
    quantity: 5000,
    unit: 'liters',
    category: 'water',
    threshold: 500,
    lastUpdated: new Date()
  },
  {
    id: 'inv-002',
    name: 'Rice Packets',
    quantity: 2000,
    unit: 'kg',
    category: 'food',
    threshold: 200,
    lastUpdated: new Date()
  },
  {
    id: 'inv-003',
    name: 'First Aid Kits',
    quantity: 500,
    unit: 'units',
    category: 'medicine',
    threshold: 50,
    lastUpdated: new Date()
  },
  {
    id: 'inv-004',
    name: 'Blankets',
    quantity: 1000,
    unit: 'units',
    category: 'shelter',
    threshold: 100,
    lastUpdated: new Date()
  },
  {
    id: 'inv-005',
    name: 'Canned Food',
    quantity: 3000,
    unit: 'cans',
    category: 'food',
    threshold: 300,
    lastUpdated: new Date()
  },
  {
    id: 'inv-006',
    name: 'Antibiotics',
    quantity: 800,
    unit: 'packs',
    category: 'medicine',
    threshold: 100,
    lastUpdated: new Date()
  },
  {
    id: 'inv-007',
    name: 'Tents',
    quantity: 200,
    unit: 'units',
    category: 'shelter',
    threshold: 20,
    lastUpdated: new Date()
  },
  {
    id: 'inv-008',
    name: 'Clothing Kits',
    quantity: 600,
    unit: 'sets',
    category: 'clothing',
    threshold: 60,
    lastUpdated: new Date()
  }
]

const centersData = [
  {
    id: 'center-001',
    name: 'Downtown Emergency Shelter',
    location: { lat: 37.7849, lng: -122.4094 },
    capacity: 500,
    peopleCount: 450,
    requiredResources: [
      { itemId: 'inv-001', quantity: 500 },
      { itemId: 'inv-002', quantity: 200 },
      { itemId: 'inv-003', quantity: 50 }
    ],
    shortageLevel: 8,
    status: 'critical'
  },
  {
    id: 'center-002',
    name: 'Oakland Relief Center',
    location: { lat: 37.8044, lng: -122.2712 },
    capacity: 300,
    peopleCount: 280,
    requiredResources: [
      { itemId: 'inv-001', quantity: 300 },
      { itemId: 'inv-005', quantity: 150 },
      { itemId: 'inv-004', quantity: 100 }
    ],
    shortageLevel: 7,
    status: 'critical'
  },
  {
    id: 'center-003',
    name: 'Berkeley Community Center',
    location: { lat: 37.8716, lng: -122.2727 },
    capacity: 400,
    peopleCount: 250,
    requiredResources: [
      { itemId: 'inv-002', quantity: 100 },
      { itemId: 'inv-006', quantity: 30 },
      { itemId: 'inv-008', quantity: 50 }
    ],
    shortageLevel: 5,
    status: 'active'
  },
  {
    id: 'center-004',
    name: 'San Jose Aid Station',
    location: { lat: 37.3382, lng: -121.8863 },
    capacity: 600,
    peopleCount: 520,
    requiredResources: [
      { itemId: 'inv-001', quantity: 600 },
      { itemId: 'inv-003', quantity: 80 },
      { itemId: 'inv-007', quantity: 30 }
    ],
    shortageLevel: 9,
    status: 'critical'
  },
  {
    id: 'center-005',
    name: 'Fremont Support Hub',
    location: { lat: 37.5485, lng: -121.9886 },
    capacity: 350,
    peopleCount: 200,
    requiredResources: [
      { itemId: 'inv-002', quantity: 80 },
      { itemId: 'inv-004', quantity: 50 },
      { itemId: 'inv-005', quantity: 100 }
    ],
    shortageLevel: 4,
    status: 'stable'
  },
  {
    id: 'center-006',
    name: 'Palo Alto Emergency Base',
    location: { lat: 37.4419, lng: -122.1430 },
    capacity: 250,
    peopleCount: 180,
    requiredResources: [
      { itemId: 'inv-001', quantity: 200 },
      { itemId: 'inv-006', quantity: 20 },
      { itemId: 'inv-003', quantity: 25 }
    ],
    shortageLevel: 6,
    status: 'active'
  },
  {
    id: 'center-007',
    name: 'Daly City Relief Point',
    location: { lat: 37.6879, lng: -122.4702 },
    capacity: 200,
    peopleCount: 150,
    requiredResources: [
      { itemId: 'inv-002', quantity: 60 },
      { itemId: 'inv-004', quantity: 40 },
      { itemId: 'inv-008', quantity: 30 }
    ],
    shortageLevel: 3,
    status: 'stable'
  },
  {
    id: 'center-008',
    name: 'Richmond Crisis Center',
    location: { lat: 37.9358, lng: -122.3477 },
    capacity: 280,
    peopleCount: 260,
    requiredResources: [
      { itemId: 'inv-001', quantity: 350 },
      { itemId: 'inv-003', quantity: 40 },
      { itemId: 'inv-005', quantity: 120 }
    ],
    shortageLevel: 8,
    status: 'critical'
  }
]

export const initialCenters = centersData.map(center => ({
  ...center,
  priorityScore: calculatePriorityScore(center.peopleCount, center.shortageLevel)
}))

export const initialVolunteers = [
  {
    id: 'vol-001',
    name: 'John Smith',
    phone: '+1-555-0101',
    email: 'john.smith@email.com',
    status: 'available',
    location: { lat: 37.7649, lng: -122.4294 },
    assignedTask: null,
    skills: ['driving', 'first-aid', 'logistics']
  },
  {
    id: 'vol-002',
    name: 'Sarah Johnson',
    phone: '+1-555-0102',
    email: 'sarah.j@email.com',
    status: 'busy',
    location: { lat: 37.8144, lng: -122.2612 },
    assignedTask: 'Delivering supplies to Oakland Relief Center',
    skills: ['medical', 'counseling']
  },
  {
    id: 'vol-003',
    name: 'Michael Chen',
    phone: '+1-555-0103',
    email: 'mchen@email.com',
    status: 'available',
    location: { lat: 37.3582, lng: -121.8963 },
    assignedTask: null,
    skills: ['driving', 'heavy-lifting', 'cooking']
  },
  {
    id: 'vol-004',
    name: 'Emily Davis',
    phone: '+1-555-0104',
    email: 'emily.d@email.com',
    status: 'available',
    location: { lat: 37.4519, lng: -122.1530 },
    assignedTask: null,
    skills: ['medical', 'first-aid', 'translation']
  },
  {
    id: 'vol-005',
    name: 'David Wilson',
    phone: '+1-555-0105',
    email: 'dwilson@email.com',
    status: 'offline',
    location: { lat: 37.5585, lng: -121.9786 },
    assignedTask: null,
    skills: ['driving', 'logistics']
  },
  {
    id: 'vol-006',
    name: 'Lisa Brown',
    phone: '+1-555-0106',
    email: 'lisa.b@email.com',
    status: 'available',
    location: { lat: 37.8816, lng: -122.2627 },
    assignedTask: null,
    skills: ['counseling', 'childcare', 'cooking']
  },
  {
    id: 'vol-007',
    name: 'Robert Taylor',
    phone: '+1-555-0107',
    email: 'rtaylor@email.com',
    status: 'busy',
    location: { lat: 37.6979, lng: -122.4602 },
    assignedTask: 'Setting up tents at Richmond Crisis Center',
    skills: ['construction', 'heavy-lifting']
  },
  {
    id: 'vol-008',
    name: 'Jennifer Martinez',
    phone: '+1-555-0108',
    email: 'jmartinez@email.com',
    status: 'available',
    location: { lat: 37.9458, lng: -122.3377 },
    assignedTask: null,
    skills: ['medical', 'first-aid', 'driving']
  }
]

export const initialDispatches = [
  {
    id: 'dispatch-001',
    centerId: 'center-002',
    centerName: 'Oakland Relief Center',
    items: [
      { itemId: 'inv-001', itemName: 'Bottled Water', quantity: 200 },
      { itemId: 'inv-005', itemName: 'Canned Food', quantity: 100 }
    ],
    volunteerId: 'vol-002',
    volunteerName: 'Sarah Johnson',
    routeDistance: 12.5,
    status: 'in-transit',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    estimatedArrival: new Date(Date.now() + 1800000) // 30 mins from now
  },
  {
    id: 'dispatch-002',
    centerId: 'center-008',
    centerName: 'Richmond Crisis Center',
    items: [
      { itemId: 'inv-007', itemName: 'Tents', quantity: 15 },
      { itemId: 'inv-004', itemName: 'Blankets', quantity: 50 }
    ],
    volunteerId: 'vol-007',
    volunteerName: 'Robert Taylor',
    routeDistance: 18.3,
    status: 'in-transit',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    estimatedArrival: new Date(Date.now() + 900000) // 15 mins from now
  },
  {
    id: 'dispatch-003',
    centerId: 'center-001',
    centerName: 'Downtown Emergency Shelter',
    items: [
      { itemId: 'inv-003', itemName: 'First Aid Kits', quantity: 30 }
    ],
    volunteerId: 'vol-001',
    volunteerName: 'John Smith',
    routeDistance: 2.1,
    status: 'delivered',
    timestamp: new Date(Date.now() - 86400000) // 1 day ago
  }
]
