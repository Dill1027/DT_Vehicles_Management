const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { allowRoles, publicUser } = require('../middleware/auth');
const { auditedWrite } = require('../utils/audit');
router.use(allowRoles('admin'));
const roles = ['admin', 'editor', 'viewer'];
const errorResponse = (res, error) => res.status(error.status || (error.code === 11000 ? 409 : 503)).json({ message: error.status ? error.message : error.code === 11000 ? 'This email is already registered.' : 'Unable to manage this user. Please try again.' });
async function lockAdmin(actor, session) {
  const result = await User.collection.updateOne({ _id: actor._id, role: 'admin', tokenVersion: actor.tokenVersion || 0 }, { $inc: { adminRevision: 1 } }, { session });
  if (!result.matchedCount) throw Object.assign(new Error('Your administrator session has changed. Sign in again.'), { status: 403 });
}
router.get('/', async (req, res) => {
  try { res.json({ data: (await User.find().sort({ createdAt: -1 }).lean()).map(publicUser) }); }
  catch { res.status(503).json({ message: 'Unable to load users.' }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 5 || password.length > 128 || !roles.includes(role)) return res.status(400).json({ message: 'Enter a valid name, email, role and password (5–128 characters).' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await auditedWrite(req.user, 'user.created', 'user', async session => {
      await lockAdmin(req.user, session);
      const [document] = await User.create([{ name, email: email.trim().toLowerCase(), passwordHash, role }], { session });
      return { document };
    });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { errorResponse(res, error); }
});
router.patch('/:id', async (req, res) => {
  try {
    if (req.params.id.toLowerCase() === String(req.user._id)) return res.status(400).json({ message: 'Use your profile to edit yourself. You cannot change your own role.' });
    if (!roles.includes(req.body.role)) return res.status(400).json({ message: 'Choose Admin, Editor or Viewer.' });
    const user = await auditedWrite(req.user, 'user.role_changed', 'user', async session => {
      await lockAdmin(req.user, session);
      const before = await User.findById(req.params.id).session(session).lean();
      const document = await User.findByIdAndUpdate(req.params.id, { $set: { role: req.body.role }, $inc: { tokenVersion: 1 } }, { new: true, runValidators: true, session });
      return { document, before };
    });
    res.json({ user: publicUser(user) });
  } catch (error) { errorResponse(res, error); }
});
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id.toLowerCase() === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    await auditedWrite(req.user, 'user.deleted', 'user', async session => {
      await lockAdmin(req.user, session);
      const document = await User.findByIdAndDelete(req.params.id, { session });
      return { document, before: document, after: {} };
    });
    res.json({ success: true });
  } catch (error) { errorResponse(res, error); }
});
module.exports = router;
