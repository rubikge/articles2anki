require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { fetchPageContent } = require('./services/scraper');

const fastify = Fastify({
  logger: true
});

// Configure CORS to allow all origins during local development
fastify.register(cors, {
  origin: '*'
});

fastify.post('/api/terms', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  const expectedKey = process.env.API_SECRET_KEY;

  if (!expectedKey) {
    fastify.log.warn('API_SECRET_KEY is not configured on the server!');
  }

  if (apiKey !== expectedKey) {
    fastify.log.warn({ ip: request.ip }, 'Unauthorized attempt to access /api/terms');
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const payload = request.body;
  fastify.log.info({ payload }, 'Received terms payload');
  console.log('--- NEW TERMS RECEIVED ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log('--------------------------');

  if (payload && payload.url) {
    const fetchResult = await fetchPageContent(payload.url);
    if (fetchResult) {
      console.log('--- FIRECRAWL RESPONSE STRUCTURE ---');
      console.log(JSON.stringify(fetchResult.rawResponseStructure, null, 2));
      console.log('--- CONTENT START (500 chars) ---');
      console.log(fetchResult.content.substring(0, 500));
      console.log('---------------------------------');
    } else {
      console.log('Failed to fetch page content from Firecrawl.');
    }
  } else {
    console.log('No URL found in the payload.');
  }

  return { success: true };
});

fastify.get('/', async (request, reply) => {
  reply.type('text/html').send('<html><head><title>Test Local Title</title></head><body><h1>Local Test Page</h1></body></html>');
});

// Run the server!
const start = async () => {
  try {
    // Listen on port 8080 and bind to 0.0.0.0 (required for Cloud Run)
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:8080');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
