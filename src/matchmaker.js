import { sanitizeForLog, validateUsername, validateMessage } from './utils.js';

const matchmakingQueue = new Set();

function handleJoin(ws, data) {
  const username = validateUsername(data.name) ? data.name.trim() : 'Anônimo';
  ws.meta = { 
    name: username, 
    joinedAt: new Date(),
    id: Math.random().toString(36).substr(2, 9)
  };
  
  // Limpa conexões inativas da fila
  cleanupQueue();
  
  if (matchmakingQueue.size > 0) {
    const partner = Array.from(matchmakingQueue)[0];
    matchmakingQueue.delete(partner);

    ws.partner = partner;
    partner.partner = ws;

    safeWsSend(ws, { type: 'match', name: partner.meta.name });
    safeWsSend(partner, { type: 'match', name: ws.meta.name });

    console.log(`🔗 Pareados: ${sanitizeForLog(ws.meta.name)} ↔ ${sanitizeForLog(partner.meta.name)}`);
  } else {
    matchmakingQueue.add(ws);
    safeWsSend(ws, { type: 'waiting' });
    console.log(`⏳ ${sanitizeForLog(ws.meta.name)} aguardando na fila`);
  }
}

function handleDisconnect(ws) {
  matchmakingQueue.delete(ws);

  if (ws.partner) {
    safeWsSend(ws.partner, { type: 'partner-disconnected' });
    ws.partner.partner = null;
  }
}

function handleMessage(ws, data) {
  if (!ws.meta) {
    return;
  }

  if (!validateMessage(data.text)) {
    return;
  }

  if (ws.partner && ws.partner.readyState === ws.partner.OPEN) {
    safeWsSend(ws.partner, {
      type: 'message',
      text: data.text.trim(),
      name: ws.meta.name
    });
  }
}



function safeWsSend(ws, data) {
  try {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
  }
}

function cleanupQueue() {
  for (const ws of matchmakingQueue) {
    if (ws.readyState !== ws.OPEN) {
      matchmakingQueue.delete(ws);
      console.log('🧹 Removido usuário inativo da fila');
    }
  }
}

function getQueueSize() {
  cleanupQueue();
  return matchmakingQueue.size;
}

export { 
  handleJoin, 
  handleMessage, 
  handleDisconnect,
  getQueueSize
};