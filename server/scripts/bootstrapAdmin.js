const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { configureMongoDns, createMongoConnector } = require('../utils/mongoConnection');
const { bootstrapAdmin } = require('../utils/bootstrapAdmin');
configureMongoDns(process.env.MONGODB_DNS_SERVERS);
(async () => {
  try {
    if (!process.env.BOOTSTRAP_ADMIN_EMAIL || !process.env.BOOTSTRAP_ADMIN_PASSWORD) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in server/.env.local first.');
    await createMongoConnector(mongoose, process.env.MONGODB_URI || process.env.DATABASE_URL)();
    await bootstrapAdmin();
    console.log('Administrator setup checked; existing accounts were preserved.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
