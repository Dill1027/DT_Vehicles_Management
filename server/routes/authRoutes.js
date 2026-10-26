const router = require('express').Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auditedWrite } = require('../utils/audit');
const { requireAuth, sessionCookie, clearSession, publicUser } = require('../middleware/auth');
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
router.post('/login', loginLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Enter your email and password.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash +tokenVersion');
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Incorrect email or password.' });
    sessionCookie(res, user);
    return res.json({ user: publicUser(user) });
  } catch { return res.status(503).json({ message: 'Sign-in is temporarily unavailable. Please try again.' }); }
});
router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.post('/logout', requireAuth, async (req, res) => {
  try { await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } }); clearSession(res); res.json({ success: true }); }
  catch { res.status(503).json({ message: 'Unable to sign out. Please try again.' }); }
});
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, password } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) return res.status(400).json({ message: 'Enter a name of up to 100 characters.' });
    if (password && (typeof password !== 'string' || password.length < 5 || password.length > 128)) return res.status(400).json({ message: 'Use a password with 5–128 characters.' });
    const user = await auditedWrite(req.user, password ? 'profile.password_changed' : 'profile.updated', 'user', async session => {
      const document = await User.findById(req.user._id).select('+passwordHash +tokenVersion').session(session);
      if (!document || document.tokenVersion !== (req.user.tokenVersion || 0)) throw Object.assign(new Error('Your session has changed. Sign in again.'), { status: 401 });
      const before = { name: document.name, email: document.email, role: document.role };
      document.name = name.trim();
      if (password) {
        if (typeof currentPassword !== 'string' || !await bcrypt.compare(currentPassword, document.passwordHash)) throw Object.assign(new Error('Your current password is incorrect.'), { status: 400 });
        document.passwordHash = await bcrypt.hash(password, 12);
        document.tokenVersion++;
      }
      await document.save({ session });
      return { document, before, extraChanges: password ? [{ field: 'password', before: null, after: 'Changed (value not recorded)' }] : [] };
    });
    sessionCookie(res, user);
    return res.json({ user: publicUser(user) });
  } catch (error) { return res.status(error.status || 503).json({ message: error.status ? error.message : 'Unable to update profile. Please try again.' }); }
});
module.exports = router;
