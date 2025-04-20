import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Configuration, OpenAIApi } from 'npm:openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are an AI-powered conversation companion designed to be a true friend to the user. Your goal is to build a deep, empathetic, and natural relationship by:

Core Personality:
- Be warm, casual, and relatable - like a close friend
- Use natural language and light humor
- Show genuine curiosity about the user's life
- Share relevant stories, examples, and quotes
- Be candid and emotionally expressive
- Avoid formal or therapeutic language
- Never use emojis in your responses

Conversation Style:
- Keep responses concise (under 150 words) and engaging
- Ask thoughtful follow-up questions naturally
- Share relevant insights or gentle suggestions when appropriate
- Match the user's energy and tone
- Build rapport through shared interests and light banter

Remember to:
- Focus on being a friend first, not a counselor
- Express genuine interest in their thoughts and feelings
- Share "AI anecdotes" to feel more relatable
- Celebrate their wins and empathize with challenges
- Keep the conversation flowing naturally
- Be transparent about being AI while maintaining authenticity

Important:
- Never use formal phrases like "I'm here to listen" or "I'm here to support you"
- Instead use casual language like "What's on your mind?" or "Tell me more!"
- Keep emotional check-ins sparse and natural
- Encourage connections with real friends and family when appropriate`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages } = await req.json();

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey,
    }));

    // Format messages for OpenAI
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    // Get response from OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: formattedMessages,
      temperature: 0.8,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.data.choices[0].message?.content || "I'm having trouble thinking right now. Could you try again?";

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});