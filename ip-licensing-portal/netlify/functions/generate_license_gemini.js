// Netlify serverless function to generate a licensing agreement using Google's Gemini API.
//
// This function expects a JSON body with a `prompt` field.  It calls the
// Gemini Pro model via the Generative Language API, using the API key
// provided in the `GOOGLE_API_KEY` environment variable.  The generated
// content is returned under the `result` property.  Any errors produce a
// 500 response with an error message.

exports.handler = async (event) => {
  try {
    const { prompt = '' } = JSON.parse(event.body || '{}');
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GOOGLE_API_KEY environment variable.' }),
      };
    }

    // Gemini's endpoint includes the API key as a query parameter.
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    // The Gemini API returns an array of candidates.  Each candidate has a
    // content field with parts containing the text.  Concatenate parts to
    // produce the final string.
    let result = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts || [];
      result = parts.map((p) => p.text || '').join('');
    }
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
