// Netlify serverless function to generate a licensing agreement using OpenAI's ChatGPT API.
//
// The function reads a `prompt` from the request body and forwards it to
// OpenAI's chat completions endpoint.  The API key should be provided via
// the `OPENAI_API_KEY` environment variable.  On success, the generated
// message content is returned under the `result` property.

exports.handler = async (event) => {
  try {
    const { prompt = '' } = JSON.parse(event.body || '{}');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing OPENAI_API_KEY environment variable.' }),
      };
    }
    // Compose the payload for the chat completion.  A system prompt is used
    // to instruct the model to act as a legal licensing assistant.  Adjust
    // max_tokens and temperature as required.
    const payload = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a legal assistant that drafts clear and concise licensing agreements based on user-provided details.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    };
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const result = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error' }),
    };
  }
};
