const bcrypt = require('bcryptjs');
const User = require('../models/User');
async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (await User.exists({})) return;
  try {
    await User.create({ name: 'Administrator', email: email.toLowerCase(), role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
    console.log('Initial administrator account created.');
  } catch (error) { if (error.code !== 11000) throw error; }
}
module.exports = { bootstrapAdmin };
