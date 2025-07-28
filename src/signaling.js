export function handleSignaling(ws, data) {
  if (!ws.partner || ws.partner.readyState !== ws.OPEN) {
    console.warn('⚠️ Parceiro não está disponível.')
    return
  }

  // Repassa o conteúdo direto, para que frontend receba { type: "signal", sdp, candidate, from }
  ws.partner.send(JSON.stringify({
    type: 'signal',
    sdp: data.sdp,
    candidate: data.candidate,
    from: ws.meta?.name || 'Desconhecido'
  }))
}
