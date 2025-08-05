// Função para sanitizar entrada de usuário para logs
export function sanitizeForLog(input) {
  if (typeof input !== 'string') return String(input);
  return input.replace(/[\r\n\t]/g, ' ').substring(0, 100);
}

// Função para validar nome de usuário
export function validateUsername(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && 
         trimmed.length <= 30 && 
         /^[a-zA-Z0-9\sÀ-ÿ]+$/.test(trimmed) &&
         !containsProfanity(trimmed);
}

// Função para validar mensagem
export function validateMessage(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && 
         trimmed.length <= 500 &&
         !containsProfanity(trimmed);
}

// Lista básica de palavras proibidas (pode ser expandida)
const profanityList = [
  'spam', 'scam', 'hack', 'admin', 'moderator'
];

// Função para detectar conteúdo inadequado
function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

// Função para rate limiting
const userMessageCounts = new Map();

export function checkRateLimit(userId, maxMessages = 10, timeWindow = 60000) {
  const now = Date.now();
  const userMessages = userMessageCounts.get(userId) || [];
  
  // Remove mensagens antigas
  const recentMessages = userMessages.filter(timestamp => now - timestamp < timeWindow);
  
  if (recentMessages.length >= maxMessages) {
    return false;
  }
  
  recentMessages.push(now);
  userMessageCounts.set(userId, recentMessages);
  return true;
}

// Limpeza periódica do rate limiting
setInterval(() => {
  const now = Date.now();
  for (const [userId, messages] of userMessageCounts.entries()) {
    const recentMessages = messages.filter(timestamp => now - timestamp < 60000);
    if (recentMessages.length === 0) {
      userMessageCounts.delete(userId);
    } else {
      userMessageCounts.set(userId, recentMessages);
    }
  }
}, 60000);