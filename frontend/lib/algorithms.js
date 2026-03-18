// Algorithm implementations for Disaster Relief Resource Management System

/**
 * GREEDY ALGORITHM - Resource Allocation
 * Sorts relief centers by priorityScore (DESC) and allocates resources
 * to highest priority centers first until inventory is exhausted.
 */
export function greedyResourceAllocation(centers, inventory, resourceId) {
  // Sort centers by priority score in descending order
  const sortedCenters = [...centers].sort((a, b) => b.priorityScore - a.priorityScore)
  
  // Find available quantity for the resource
  const resource = inventory.find(item => item.id === resourceId)
  if (!resource) return []
  
  let remainingQuantity = resource.quantity
  const allocations = []
  
  for (const center of sortedCenters) {
    if (remainingQuantity <= 0) break
    
    // Find how much this center needs
    const requirement = center.requiredResources.find(r => r.itemId === resourceId)
    if (!requirement) continue
    
    // Allocate as much as possible
    const toAllocate = Math.min(requirement.quantity, remainingQuantity)
    if (toAllocate > 0) {
      allocations.push({ centerId: center.id, allocated: toAllocate })
      remainingQuantity -= toAllocate
    }
  }
  
  return allocations
}

/**
 * PRIORITY QUEUE - Emergency Request Processing
 * Maintains a priority queue of centers based on priority score.
 * Uses a max-heap like sorted array implementation.
 */
export class PriorityQueue {
  constructor(centers) {
    this.items = []
    if (centers) {
      this.items = [...centers].sort((a, b) => b.priorityScore - a.priorityScore)
    }
  }
  
  enqueue(center) {
    // Binary search for insertion position to maintain sorted order
    let left = 0
    let right = this.items.length
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (this.items[mid].priorityScore > center.priorityScore) {
        left = mid + 1
      } else {
        right = mid
      }
    }
    
    this.items.splice(left, 0, center)
  }
  
  dequeue() {
    return this.items.shift() // Returns highest priority (first element)
  }
  
  peek() {
    return this.items[0]
  }
  
  isEmpty() {
    return this.items.length === 0
  }
  
  size() {
    return this.items.length
  }
  
  getAll() {
    return [...this.items]
  }
  
  updatePriority(centerId, newPriorityScore) {
    const index = this.items.findIndex(c => c.id === centerId)
    if (index !== -1) {
      const center = { ...this.items[index], priorityScore: newPriorityScore }
      this.items.splice(index, 1)
      this.enqueue(center)
    }
  }
}

/**
 * DIJKSTRA'S ALGORITHM - Shortest Path
 * Computes shortest path from warehouse to relief center using graph representation.
 */
export function dijkstraShortestPath(nodes, edges, startId, endId) {
  // Build adjacency list
  const adjacencyList = new Map()
  
  for (const node of nodes) {
    adjacencyList.set(node.id, [])
  }
  
  for (const edge of edges) {
    adjacencyList.get(edge.from)?.push({ nodeId: edge.to, distance: edge.distance })
    adjacencyList.get(edge.to)?.push({ nodeId: edge.from, distance: edge.distance }) // Undirected
  }
  
  // Initialize distances
  const distances = new Map()
  const previous = new Map()
  const visited = new Set()
  
  for (const node of nodes) {
    distances.set(node.id, Infinity)
    previous.set(node.id, null)
  }
  distances.set(startId, 0)
  
  // Priority queue using simple array (for small graphs)
  const queue = [startId]
  
  while (queue.length > 0) {
    // Get node with minimum distance
    queue.sort((a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity))
    const current = queue.shift()
    
    if (visited.has(current)) continue
    visited.add(current)
    
    if (current === endId) break
    
    const neighbors = adjacencyList.get(current) || []
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) continue
      
      const newDistance = (distances.get(current) || 0) + neighbor.distance
      if (newDistance < (distances.get(neighbor.nodeId) || Infinity)) {
        distances.set(neighbor.nodeId, newDistance)
        previous.set(neighbor.nodeId, current)
        if (!queue.includes(neighbor.nodeId)) {
          queue.push(neighbor.nodeId)
        }
      }
    }
  }
  
  // Reconstruct path
  const path = []
  let current = endId
  while (current !== null) {
    path.unshift(current)
    current = previous.get(current) || null
  }
  
  return {
    distance: distances.get(endId) || Infinity,
    path: path[0] === startId ? path : []
  }
}

/**
 * EUCLIDEAN DISTANCE CALCULATION
 * Calculates distance between two geographic points using Haversine formula.
 */
export function calculateDistance(point1, point2) {
  // Haversine formula for accurate geographic distance
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

/**
 * NEAREST VOLUNTEER SELECTION
 * Finds the closest available volunteer to a relief center.
 */
export function findNearestVolunteer(volunteers, centerLocation) {
  const availableVolunteers = volunteers.filter(v => v.status === 'available')
  
  if (availableVolunteers.length === 0) return null
  
  let nearest = null
  let minDistance = Infinity
  
  for (const volunteer of availableVolunteers) {
    const distance = calculateDistance(volunteer.location, centerLocation)
    if (distance < minDistance) {
      minDistance = distance
      nearest = volunteer
    }
  }
  
  return nearest
}

/**
 * CALCULATE PRIORITY SCORE
 * Computes the priority score for a relief center.
 */
export function calculatePriorityScore(peopleCount, shortageLevel) {
  return peopleCount * shortageLevel
}

/**
 * AUTO-DISPATCH TRIGGER
 * Determines if auto-dispatch should be triggered based on inventory levels.
 */
export function shouldTriggerAutoDispatch(item, centers) {
  // Check if any center critically needs this item
  const criticalNeed = centers.some(center => {
    const requirement = center.requiredResources.find(r => r.itemId === item.id)
    return requirement && center.priorityScore > 50 && requirement.quantity > 0
  })
  
  return item.quantity > item.threshold && criticalNeed
}

/**
 * GENERATE ROUTE GRAPH
 * Creates a graph representation of the delivery network.
 */
export function generateRouteGraph(warehouseLocation, centers) {
  const nodes = [
    { id: 'warehouse', name: 'Central Warehouse', location: warehouseLocation }
  ]
  
  const edges = []
  
  // Add all centers as nodes
  for (const center of centers) {
    nodes.push({
      id: center.id,
      name: center.name,
      location: center.location
    })
  }
  
  // Create edges between all nodes (fully connected for simplicity)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      edges.push({
        from: nodes[i].id,
        to: nodes[j].id,
        distance: calculateDistance(nodes[i].location, nodes[j].location)
      })
    }
  }
  
  return { nodes, edges }
}
