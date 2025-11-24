const mongoose = require('mongoose');
const path = require('path');
const config = require(path.resolve(__dirname, '..', 'config.js')); // ajuste si config exporte différemment

const url = process.env.MONGO_URL || process.env.MONGO_URI || config.MONGO_URL || 'mongodb://localhost:27017/tamago';

async function main() {
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const coll = mongoose.connection.db.collection('tamagotchis'); // nom de collection : vérifie si différent
  try {
    await coll.createIndex({ location: '2dsphere' });
    console.log('2dsphere index created on tamagotchis');
  } catch (err) {
    console.error('Index creation failed:', err);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});