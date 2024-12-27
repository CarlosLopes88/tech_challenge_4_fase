const mongoose = require('mongoose');

// Valores obtidos das variáveis de ambiente
const username = process.env.DOCDB_USERNAME;
const password = process.env.DOCDB_PASSWORD;
const clusterEndpoint = process.env.DOCDB_CLUSTER_ENDPOINT_CLI;
const dbName = process.env.DOCDB_DBNAME;

console.log(username, password, clusterEndpoint, dbName);

if (!username || !password || !clusterEndpoint || !dbName) {
  console.error('Environment variables are not set correctly.');
  process.exit(1);
}

const connectionString = `mongodb://${username}:${password}@${clusterEndpoint}:27017/${dbName}?authSource=admin&retryWrites=false`;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authMechanism: 'SCRAM-SHA-1' // Define o mecanismo explicitamente
});

const db = mongoose.connection;

console.log(connectionString); // Isso mostrará a string de conexão completa no console

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

module.exports = db;