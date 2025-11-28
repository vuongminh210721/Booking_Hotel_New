// Test MongoDB Atlas connection
const mongoose = require('mongoose');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

console.log('🔍 Debug - Raw URI from env:', uri);
console.log('🔍 Debug - CWD:', process.cwd());
console.log('🔍 Debug - Script dir:', __dirname);

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB Atlas...');
console.log('📍 URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Connection details:');
    console.log('   - Database:', mongoose.connection.db.databaseName);
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Ready State:', mongoose.connection.readyState);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('🔌 Connection closed gracefully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB Atlas');
    console.error('📋 Error details:', err.message);
    
    if (err.message.includes('authentication failed')) {
      console.error('\n💡 Tip: Check your username and password in .env');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Tip: Check your network connection or Atlas IP whitelist');
    }
    
    process.exit(1);
  });
