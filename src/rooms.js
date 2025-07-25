// src/rooms.js

const activeRooms = new Map()

function createRoom(clientA, clientB) {
  const roomId = `${clientA.meta.name}-${clientB.meta.name}-${Date.now()}`
  activeRooms.set(roomId, [clientA, clientB])
  return roomId
}

function getRoomByClient(client) {
  for (const [roomId, clients] of activeRooms) {
    if (clients.includes(client)) return { roomId, clients }
  }
  return null
}

function removeRoomByClient(client) {
  const entry = getRoomByClient(client)
  if (entry) activeRooms.delete(entry.roomId)
}

export { createRoom, getRoomByClient, removeRoomByClient }
