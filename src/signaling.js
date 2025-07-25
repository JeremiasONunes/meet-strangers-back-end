// src/signaling.js

export function handleSignaling(ws, data) {
  if (!ws.partner || ws.partner.readyState !== ws.OPEN) {
    console.warn('⚠️ Parceiro não está disponível.')
    return
  }

  // Repassa sinalização para o parceiro
  ws.partner.send(JSON.stringify({
    type: 'signal',
    signalType: data.signalType,
    payload: data.payload,
    from: ws.meta?.name || 'Desconhecido'
  }))
}
