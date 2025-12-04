require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const emails = ['mbende2000@hotmail.com', 'sam.mbende2@gmail.com', 'mbendevinaflore@gmail.com'];
  const result = await db.collection('emailverificationtokens').deleteMany({
    email: { $in: emails }
  });
  
  console.log('Deleted ' + result.deletedCount + ' orphaned tokens');
  process.exit(0);
}

cleanup().catch(e => {
  console.error(e.message);
  process.exit(1);
});
