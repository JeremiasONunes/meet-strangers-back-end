const matchmakingQueue = new Set()

function handleJoin(ws, data) {
  ws.meta = { name: data.name || 'Anônimo' }

  if (matchmakingQueue.size > 0) {
    const [partner] = matchmakingQueue
    matchmakingQueue.delete(partner)

    ws.partner = partner
    partner.partner = ws

    ws.send(JSON.stringify({ type: 'match', name: partner.meta.name }))
    partner.send(JSON.stringify({ type: 'match', name: ws.meta.name }))

    console.log(`🔗 Pareados: ${ws.meta.name} ↔ ${partner.meta.name}`)
  } else {
    matchmakingQueue.add(ws)
    ws.send(JSON.stringify({ type: 'waiting' }))
    console.log(`⏳ ${ws.meta.name} aguardando na fila`)
  }
}
function handleDisconnect(ws) {
  matchmakingQueue.delete(ws);

  if (ws.partner) {
    ws.partner.send(JSON.stringify({ type: "partner-disconnected" }));
    ws.partner.partner = null;
  }
}
function handleMessage(ws, data) {
  if (ws.partner && ws.partner.readyState === ws.OPEN) {
    ws.partner.send(JSON.stringify({
      type: 'message',
      text: data.text,
      name: ws.meta.name
    }))
  }
}

export { matchmakingQueue, handleJoin, handleMessage }
