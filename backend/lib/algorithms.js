export function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function findNearestVolunteer(volunteers, centerLocation) {
  const availableVolunteers = volunteers.filter(v => v.status === 'available');
  
  if (availableVolunteers.length === 0) return null;
  
  let nearest = null;
  let minDistance = Infinity;
  
  for (const volunteer of availableVolunteers) {
    const distance = calculateDistance(volunteer.location, centerLocation);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = volunteer;
    }
  }
  
  return nearest;
}

export function calculatePriorityScore(peopleCount, shortageLevel) {
  return peopleCount * shortageLevel;
}
