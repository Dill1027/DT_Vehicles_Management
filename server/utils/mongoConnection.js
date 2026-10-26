const dns = require('node:dns');

// Applies only to this Node process; leave unset to use the system resolver.
function configureMongoDns(value, resolver = dns) {
  if (!value || !value.trim()) return;
  const servers = value.split(',').map(server => server.trim()).filter(Boolean);
  if (servers.length) resolver.setServers(servers);
}

function createMongoConnector(mongoose, uri, connectionTimeoutMS = 15000) {
  let pendingConnection = null;
  return function connectToDatabase() {
    if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
    if (pendingConnection) return pendingConnection;

    // Share an in-progress attempt across startup and simultaneous API requests.
    // The driver's server selection timeout does not bound Atlas SRV/TXT DNS
    // discovery. Bound callers too, retaining the attempt until it settles.
    pendingConnection = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const error = new Error('Database connection timed out. Check Atlas DNS and network access.');
        error.name = 'MongoServerSelectionError';
        reject(error);
      }, connectionTimeoutMS);
      Promise.resolve().then(() => mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        waitQueueTimeoutMS: 5000,
        maxPoolSize: 10,
        retryReads: true
      })).then(connection => {
        clearTimeout(timer);
        pendingConnection = null;
        resolve(connection);
      }, error => {
        clearTimeout(timer);
        pendingConnection = null;
        reject(error);
      });
    });
    return pendingConnection;
  };
}

module.exports = { configureMongoDns, createMongoConnector };
