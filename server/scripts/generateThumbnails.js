const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { createThumbnail } = require('../utils/thumbnail');
const { configureMongoDns, createMongoConnector } = require('../utils/mongoConnection');
const { withDeadline } = require('../utils/withDeadline');
configureMongoDns(process.env.MONGODB_DNS_SERVERS);
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 10000, socketTimeoutMS: 30000, readPreference: 'secondaryPreferred' });
    const vehicles = await Vehicle.find({ thumbnailData: { $in: [null, ''] } }).select('_id').lean();
    for (const vehicle of vehicles) {
      try {
        const [record] = await withDeadline(Vehicle.aggregate([
          { $match: { _id: vehicle._id } },
          { $project: { updatedAt: 1, thumbnailData: 1, source: { $ifNull: [{ $arrayElemAt: ['$vehicleImages', 0] }, '$imageUrl'] } } }
        ]).option({ readPreference: 'secondaryPreferred', maxTimeMS: 8000 }).exec(), 45000);
        if (!record?.source || record.thumbnailData) continue;
        const thumbnail = await createThumbnail(record.source);
        if (!thumbnail) continue;
        const result = await Vehicle.updateOne({ _id: vehicle._id, updatedAt: record.updatedAt }, { $set: { thumbnailData: thumbnail } }, { timestamps: false });
        console.log('Thumbnail:', String(vehicle._id), result.modifiedCount ? Buffer.byteLength(thumbnail) + ' bytes' : 'vehicle changed; skipped');
      } catch (error) { console.log('Thumbnail skipped:', String(vehicle._id), error.name); process.exitCode = 1; }
    }
  } catch (error) { console.log('Thumbnail generation failed:', error.name); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
