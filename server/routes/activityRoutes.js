const router = require('express').Router();
const { Types } = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const { allowRoles } = require('../middleware/auth');
router.use(allowRoles('admin'));
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.action) {
      if (!/^[a-z]+\.[a-z_]+$/.test(req.query.action)) return res.status(400).json({ message: 'Invalid action filter.' });
      filter.action = req.query.action;
    }
    for (const key of ['vehicle', 'entityId']) if (req.query[key]) {
      if (!Types.ObjectId.isValid(req.query[key])) return res.status(400).json({ message: 'Invalid record filter.' });
      filter[key] = new Types.ObjectId(req.query[key]);
    }
    if (req.query.from || req.query.to) {
      const { validDate } = require('../utils/operationRecords');
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(validDate(req.query.from) + 'T00:00:00+05:30');
      if (req.query.to) filter.createdAt.$lt = new Date(new Date(validDate(req.query.to) + 'T00:00:00+05:30').getTime() + 86400000);
      if (req.query.from && req.query.to && req.query.from > req.query.to) return res.status(400).json({ message: 'The end date must follow the start date.' });
    }
    const page = Number(req.query.page || 1), limit = 25;
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) return res.status(400).json({ message: 'Choose a valid page.' });
    const [data, total] = await Promise.all([ActivityLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), ActivityLog.countDocuments(filter)]);
    res.json({ data, pagination: { page, pages: Math.max(1, Math.ceil(total / limit)), total } });
  } catch (error) { res.status(error.status || 503).json({ message: error.status ? error.message : 'Unable to load activity. Please try again.' }); }
});
module.exports = router;
