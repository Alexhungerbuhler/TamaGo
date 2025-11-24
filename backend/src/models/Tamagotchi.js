const mongoose = require('mongoose');

const TamagotchiSchema = new mongoose.Schema({
  name: String,
  level: Number,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
}, { timestamps: true });

// create 2dsphere index for geospatial queries
TamagotchiSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Tamagotchi', TamagotchiSchema);