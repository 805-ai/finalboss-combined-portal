exports.handler = async (event, context) => {
  // Only allow POST requests.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  /*
   * This is a minimal example of an NDA upload handler for Netlify Functions.
   * Netlify wraps the request body in a base64-encoded string when sending
   * binary data (like files). Parsing multipart form data on a serverless
   * function requires additional libraries such as `formidable` or `busboy`.
   * To keep this MVP lightweight and dependency-free, the handler does not
   * actually store the uploaded file. Instead it simply returns a success
   * message. In a production deployment, you would parse `event.body` using
   * a multipart parser and then upload the file to your chosen storage
   * provider (e.g. Amazon S3) using appropriate SDK calls.
   */

  try {
    // Simulate asynchronous storage operation (e.g. saving to S3)
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Allow CORS for all origins. You can restrict this to your domain.
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Your NDA has been received and will be reviewed.' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to process the uploaded file.' }),
    };
  }
};
