// server.js
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleJoin, handleMessage, matchmakingQueue } from './matchmaker.js';

const app = express();
const server = http.createServer(app); // HTTP server compatível com Render
const wss = new WebSocketServer({ server }); // WebSocket usando o mesmo server

// Middleware opcional para verificação de vida
app.get('/', (req, res) => {
  res.send('🚀 Servidor WebSocket com suporte WSS está rodando!');
});

// Evento de nova conexão WebSocket
wss.on('connection', (ws) => {
  console.log('⚡ Novo cliente conectado');

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);

      switch (parsed.type) {
        case 'join':
          handleJoin(ws, parsed);
          break;
        case 'message':
          handleMessage(ws, parsed);
          break;
        default:
          console.log('❓ Tipo de mensagem desconhecido:', parsed);
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Cliente desconectado');
    matchmakingQueue.delete(ws);

    if (ws.partner) {
      ws.partner.send(JSON.stringify({ type: 'partner-disconnected' }));
      ws.partner.partner = null;
    }
  });

  
});

// Usa a porta do ambiente (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
