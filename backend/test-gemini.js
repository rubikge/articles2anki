require('dotenv').config();
const { extractTerms } = require('./services/gemini');

const sampleText = `
Fastify is a web framework highly focused on providing the best developer experience with minimal overhead and a powerful plugin architecture, inspired by Hapi and Express. It is one of the fastest web frameworks in the Node.js ecosystem. It natively supports JSON schema validation for inputs and outputs, and relies on pino for high-performance logging.
`;

(async () => {
  console.log('--- Starting Gemini Term Extraction Test ---');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.error('ERROR: Please configure a valid GEMINI_API_KEY in backend/.env before running this test.');
    process.exit(1);
  }

  console.log(`Using model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash'}`);
  console.log('Sending sample text to Gemini...');
  
  try {
    const terms = await extractTerms(sampleText);
    console.log('\n--- SUCCESS! Extracted Terms ---');
    console.log(JSON.stringify(terms, null, 2));
    console.log('--------------------------------');
  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    console.error(error.message);
    process.exit(1);
  }
})();
