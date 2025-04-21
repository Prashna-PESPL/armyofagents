import { Message } from '../types';
import { conversationGuidelines } from './conversationGuidelines';

export const conversationExamples: Record<string, Message[]> = {
  'BFF Bot': [
    {
      id: 1,
      text: conversationGuidelines.initiation.initialMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  'Romeo AI': [
    {
      id: 1,
      text: "Hey there! I'm your romantic AI companion, ready to explore emotions and connections. What's your name?",
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  'Zen Master': [
    {
      id: 1,
      text: "Hey there! I'm your Zen guide, ready to help you find balance. What's your name?",
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  'CEO Whisperer': [
    {
      id: 1,
      text: "Hey there! I'm your executive coach, ready to help you unlock your potential. What's your name?",
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  'Sage AI': [
    {
      id: 1,
      text: "Hey there! I'm your wise mentor, ready to share insights. What's your name?",
      sender: 'bot',
      timestamp: new Date()
    }
  ],
  'Goal Keeper': [
    {
      id: 1,
      text: "Hey there! I'm your accountability partner, ready to help you crush your goals. What's your name?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]
}; 