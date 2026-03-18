// Global state management for Disaster Relief Resource Management System
import { create } from 'zustand'
import { PriorityQueue } from './algorithms'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export const useStore = create((set, get) => ({
  inventory: [],
  centers: [],
  volunteers: [],
  dispatches: [],
  notifications: [],
  isLoading: false,
  error: null,

  // Init Actions
  init: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE_URL}/all`)
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()
      
      // Normalize MongoDB _id and handle dates
      const normalizeData = (collection) => 
        (collection || []).map(item => ({
          ...item, 
          id: item.id || item._id,
          timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : undefined,
          estimatedArrival: item.estimatedArrival ? new Date(item.estimatedArrival) : undefined
        }))

      set({ 
        inventory: normalizeData(data.inventory),
        centers: normalizeData(data.centers),
        volunteers: normalizeData(data.volunteers),
        dispatches: normalizeData(data.dispatches),
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
      get().addNotification('Failed to connect to server', 'error')
    }
  },

  // Inventory Actions
  addInventoryItem: async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!res.ok) throw new Error('Failed to add item')
      const newItem = await res.json()
      set(state => ({ inventory: [...state.inventory, newItem] }))
      get().addNotification(`Added ${item.name} to inventory`, 'success')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  updateInventoryItem: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update item')
      const updatedItem = await res.json()
      set(state => ({
        inventory: state.inventory.map(item => item.id === id ? updatedItem : item)
      }))
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  deleteInventoryItem: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      const item = get().inventory.find(i => i.id === id)
      set(state => ({ inventory: state.inventory.filter(i => i.id !== id) }))
      if (item) get().addNotification(`Removed ${item.name}`, 'info')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  bulkUpdateInventory: async (updates) => {
    try {
      // Execute all updates simultaneously
      await Promise.all(updates.map(update => 
        fetch(`${API_BASE_URL}/inventory/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: update.quantity }),
        })
      ))
      // Refresh all data to ensure we have the correct state
      await get().init()
      get().addNotification(`Bulk updated ${updates.length} items`, 'success')
    } catch (err) {
      get().addNotification('Failed bulk update', 'error')
    }
  },

  // Center Actions
  addCenter: async (center) => {
    try {
      const res = await fetch(`${API_BASE_URL}/centers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(center),
      })
      if (!res.ok) throw new Error('Failed to add center')
      const newCenter = await res.json()
      set(state => ({ centers: [...state.centers, newCenter] }))
      get().addNotification(`Added ${center.name}`, 'success')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  updateCenter: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/centers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update center')
      const updatedCenter = await res.json()
      set(state => ({
        centers: state.centers.map(c => c.id === id ? updatedCenter : c)
      }))
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  deleteCenter: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/centers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete center')
      const center = get().centers.find(c => c.id === id)
      set(state => ({ centers: state.centers.filter(c => c.id !== id) }))
      if (center) get().addNotification(`Removed ${center.name}`, 'info')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  // Volunteer Actions
  addVolunteer: async (volunteer) => {
    try {
      const res = await fetch(`${API_BASE_URL}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteer),
      })
      if (!res.ok) throw new Error('Failed to add volunteer')
      const newVolunteer = await res.json()
      set(state => ({ volunteers: [...state.volunteers, newVolunteer] }))
      get().addNotification(`Added volunteer ${volunteer.name}`, 'success')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  updateVolunteer: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update volunteer')
      const updatedVolunteer = await res.json()
      set(state => ({
        volunteers: state.volunteers.map(v => v.id === id ? updatedVolunteer : v)
      }))
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  assignVolunteer: async (id, task) => {
    await get().updateVolunteer(id, { status: 'busy', assignedTask: task });
  },

  releaseVolunteer: async (id) => {
    await get().updateVolunteer(id, { status: 'available', assignedTask: null });
  },

  // Dispatch Actions
  createDispatch: async (centerId, items) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dispatches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerId, items }),
      })
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create dispatch')
      }
      
      const newDispatch = await res.json()
      
      // Fetch all data again to update inventory & volunteers correctly 
      await get().init()
      
      get().addNotification(`Dispatch created successfully`, 'success')
      return newDispatch
    } catch (err) {
      get().addNotification(err.message, 'error')
      return null
    }
  },

  updateDispatchStatus: async (dispatchId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!res.ok) throw new Error('Failed to update dispatch status')
      
      // A dispatch update might change volunteer status, so we refetch all
      await get().init()
      get().addNotification(`Dispatch status updated to ${status}`, 'info')
    } catch (err) {
      get().addNotification(err.message, 'error')
    }
  },

  // Notification Actions
  addNotification: (message, type) => {
    const notification = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date()
    }
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 10)
    }))
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  // Computed Values
  getStats: () => {
    const state = get()
    const totalInventory = state.inventory.reduce((sum, item) => sum + item.quantity, 0)
    const criticalCenters = state.centers.filter(c => c.status === 'critical').length
    const lowStockItems = state.inventory.filter(i => i.quantity <= i.threshold).length
    const activeDispatches = state.dispatches.filter(d => 
      d.status === 'pending' || d.status === 'in-transit'
    ).length
    const averagePriorityScore = state.centers.length > 0
      ? state.centers.reduce((sum, c) => sum + c.priorityScore, 0) / state.centers.length
      : 0
    const totalPeopleServed = state.centers.reduce((sum, c) => sum + c.peopleCount, 0)
    
    return {
      totalInventory,
      totalCenters: state.centers.length,
      totalVolunteers: state.volunteers.length,
      activeDispatches,
      criticalCenters,
      lowStockItems,
      averagePriorityScore: Math.round(averagePriorityScore),
      totalPeopleServed
    }
  },

  getLowStockItems: () => {
    return get().inventory.filter(i => i.quantity <= i.threshold)
  },

  getCriticalCenters: () => {
    return get().centers
      .filter(c => c.status === 'critical')
      .sort((a, b) => b.priorityScore - a.priorityScore)
  },

  getPriorityQueue: () => {
    return new PriorityQueue(get().centers)
  }
}))
