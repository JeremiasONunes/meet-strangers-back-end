import WebSocket, { WebSocketServer } from 'ws'
import { handleJoin, handleMessage, matchmakingQueue } from './matchmaker.js'
import { handleSignaling } from './signaling.js'

const wss = new WebSocketServer({ port: 3000 })

wss.on('connection', (ws) => {
  console.log('⚡ Novo cliente conectado')

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data)

      switch (parsed.type) {
        case 'join':
          handleJoin(ws, parsed)
          break
        case 'message':
          handleMessage(ws, parsed)
          break
        case 'signal':
          handleSignaling(ws, parsed)
          break
        default:
          console.log('❓ Tipo de mensagem desconhecido:', parsed)
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err)
    }
  })

  ws.on('close', () => {
    console.log('🔌 Cliente desconectado')
    matchmakingQueue.delete(ws)

    if (ws.partner) {
      ws.partner.send(JSON.stringify({ type: 'partner-disconnected' }))
      ws.partner.partner = null
    }
  })
})

console.log('🚀 Servidor WebSocket rodando em ws://localhost:3000')
