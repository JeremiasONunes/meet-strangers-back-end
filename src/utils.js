// src/utils.js

export function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length)
}

export function log(type, message) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`)
}

