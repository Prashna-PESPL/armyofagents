import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Configuration, OpenAIApi } from 'npm:openai@3.3.0';
import { SYSTEM_PROMPT, OPENAI_CONFIG } from './config.ts';
import { validateMessages, checkRateLimit, ValidationError, RateLimitError } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    checkRateLimit(clientIp);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages } = await req.json();

    // Validate messages
    const validatedMessages = validateMessages(messages);

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey,
    }));

    // Format messages for OpenAI
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...validatedMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    // Get response from OpenAI
    const completion = await openai.createChatCompletion({
      model: OPENAI_CONFIG.model,
      messages: formattedMessages,
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.max_tokens,
      presence_penalty: OPENAI_CONFIG.presence_penalty,
      frequency_penalty: OPENAI_CONFIG.frequency_penalty,
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
    
    let status = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof ValidationError) {
      status = 400;
      errorMessage = error.message;
    } else if (error instanceof RateLimitError) {
      status = 429;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      if (error.message.includes('API key')) {
        status = 500;
        errorMessage = 'Server configuration error';
      } else if (error.message.includes('OpenAI')) {
        status = 503;
        errorMessage = 'Service temporarily unavailable';
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        type: error instanceof Error ? error.name : 'UnknownError'
      }),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});