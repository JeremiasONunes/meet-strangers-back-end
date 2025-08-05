import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { handleJoin, handleMessage, handleDisconnect, getQueueSize } from './matchmaker.js';
import { sanitizeForLog } from './utils.js';

const app = express();

// Configuração de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://meet-strangers-front-end.onrender.com', /\.vercel\.app$/] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

const server = http.createServer(app);
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info) => {
    const origin = info.origin;
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://meet-strangers-front-end.onrender.com']
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];
    
    // Aceita qualquer domínio .vercel.app
    if (origin && origin.includes('.vercel.app')) {
      return true;
    }
    return !origin || allowedOrigins.includes(origin);
  }
});

// Middleware para verificação de vida
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MeetStranger Backend rodando',
    queueSize: getQueueSize(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
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
          console.log('❓ Tipo de mensagem desconhecido:', sanitizeForLog(parsed.type || 'undefined'));
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Cliente desconectado:', sanitizeForLog(ws.meta?.name || 'Anônimo'));
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
    handleDisconnect(ws);
  });

  
});

// Usa a porta do ambiente (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
