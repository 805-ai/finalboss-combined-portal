// Netlify serverless function to generate a licensing agreement using Anthropic's Claude API.
//
// The function expects a JSON body containing a `prompt` field.  It reads the
// Anthropic API key from the environment variable `ANTHROPIC_API_KEY` and
// forwards the prompt to the Claude messages endpoint.  The response text is
// returned as JSON under the `result` property.  If the API key is missing or
// an error occurs, the function returns an appropriate HTTP error code and
// message.

exports.handler = async (event) => {
  try {
    // Parse the incoming request body.  If no body is provided, default to an
    // empty object to avoid JSON.parse throwing.
    const { prompt = '' } = JSON.parse(event.body || '{}');

    // Read the Anthropic API key from the environment.  This key should be
    // configured in your Netlify site settings under Environment variables.
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY environment variable.' }),
      };
    }

    // Construct the payload for the Claude messages endpoint.  We use the
    // lightweight Haiku model for cost efficiency.  Feel free to change the
    // model name or parameters (max_tokens, temperature) as needed.
    const payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      temperature: 0.2,
      messages: [
        { role: 'user', content: prompt },
      ],
    };

    // Make the request to Anthropic's API.  The fetch API is available in
    // Netlify functions, so no additional dependencies are required.
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        // Specify the API version.  The date here corresponds to the messages
        // API release; updating this value may be necessary in the future.
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    // Attempt to parse the response.  On success, extract the generated text
    // from the response structure.  Anthropic returns an array of content
    // objects with a `text` field.
    const data = await response.json();
    const result = (data.content && data.content[0] && data.content[0].text) || '';

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    // Catch and report any unexpected errors.  Returning the error message in
    // the body can aid debugging during development.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error' }),
    };
  }
};
