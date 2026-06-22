const Fastify = require('fastify');
const cors = require('@fastify/cors');

const fastify = Fastify({
  logger: true
});

// Configure CORS to allow all origins during local development
fastify.register(cors, {
  origin: '*'
});

fastify.post('/api/terms', async (request, reply) => {
  const payload = request.body;
  fastify.log.info({ payload }, 'Received terms payload');
  console.log('--- NEW TERMS RECEIVED ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log('--------------------------');
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
