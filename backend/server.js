require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { fetchPageContent } = require('./services/scraper');
const anki = require('./services/anki');

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
    const deckName = payload.title || process.env.DEFAULT_ANKI_DECK || 'Articles2Anki';

    // 1. Synchronous duplicate check
    try {
      const existingDecks = await anki.getDeckNames();
      if (existingDecks.includes(deckName)) {
        fastify.log.warn(`Deck "${deckName}" already exists. Rejecting.`);
        return reply.status(409).send({ error: 'Колода уже есть' });
      }
    } catch (err) {
      fastify.log.error('Failed to communicate with AnkiConnect: ' + err.message);
      return reply.status(500).send({ error: 'AnkiConnect unreachable' });
    }

    // 2. Send immediate response
    reply.send({ success: true, message: 'Processing started' });

    // 3. Asynchronous background processing
    (async () => {
      try {
        fastify.log.info(`Background: Fetching page content for ${payload.url}`);
        const fetchResult = await fetchPageContent(payload.url);
        
        let backContent = 'No content extracted.';
        if (fetchResult && fetchResult.content) {
          backContent = fetchResult.content.substring(0, 300) + '...';
        }

        fastify.log.info(`Background: Creating deck "${deckName}"`);
        await anki.createDeck(deckName);

        fastify.log.info(`Background: Adding card to deck "${deckName}"`);
        const notes = [{
          deckName: deckName,
          modelName: "Basic",
          fields: {
            "Front": payload.title || payload.url,
            "Back": backContent
          },
          options: {
            allowDuplicate: false
          },
          tags: ["articles2anki"]
        }];
        await anki.addNotes(notes);

        fastify.log.info(`Background: Syncing AnkiWeb`);
        await anki.sync();
        fastify.log.info(`Background: Processing complete for "${deckName}"`);
      } catch (err) {
        fastify.log.error('Background task failed: ' + err.message);
      }
    })();
    return; // Response already sent
  } else {
    fastify.log.warn('No URL found in the payload.');
    return reply.status(400).send({ error: 'No URL in payload' });
  }
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
