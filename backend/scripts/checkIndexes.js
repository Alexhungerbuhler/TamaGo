const mongoose = require('mongoose');
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/tamago';
async function main(){
  await mongoose.connect(url);
  console.log(await mongoose.connection.db.collection('tamagotchis').indexes());
  await mongoose.connection.close();
}
main();