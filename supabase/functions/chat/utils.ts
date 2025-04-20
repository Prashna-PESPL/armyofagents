import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
} as const;

// Message validation schema
interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function validateMessages(messages: unknown): Message[] {
  if (!Array.isArray(messages)) {
    throw new ValidationError('Messages must be an array');
  }

  if (messages.length === 0) {
    throw new ValidationError('Messages array cannot be empty');
  }

  if (messages.length > 50) {
    throw new ValidationError('Too many messages. Maximum 50 messages allowed per request');
  }

  return messages.map((msg, index) => {
    if (typeof msg !== 'object' || msg === null) {
      throw new ValidationError(`Message at index ${index} must be an object`);
    }

    if (typeof msg.sender !== 'string' || !['user', 'assistant'].includes(msg.sender)) {
      throw new ValidationError(`Message at index ${index} has invalid sender. Must be either 'user' or 'assistant'`);
    }

    if (typeof msg.text !== 'string') {
      throw new ValidationError(`Message at index ${index} must have a text property of type string`);
    }

    const trimmedText = msg.text.trim();
    if (trimmedText.length === 0) {
      throw new ValidationError(`Message at index ${index} has empty text`);
    }

    if (trimmedText.length > 1000) {
      throw new ValidationError(`Message at index ${index} is too long. Maximum 1000 characters allowed`);
    }

    return {
      sender: msg.sender as 'user' | 'assistant',
      text: trimmedText,
    };
  });
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitStore.get(ip);

  if (!userData) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.windowMs });
    return true;
  }

  if (now > userData.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.windowMs });
    return true;
  }

  if (userData.count >= RATE_LIMIT_CONFIG.maxRequests) {
    const timeLeft = Math.ceil((userData.resetTime - now) / 1000);
    throw new RateLimitError(`Rate limit exceeded. Please try again in ${timeLeft} seconds`);
  }

  userData.count++;
  return true;
}

// Clean up old rate limit data periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_CONFIG.windowMs); 