const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [{
    userId: { type: String, required: true },
    grade: { type: Number, required: true, min: 0, max: 5 }
  }],
  averageRating: { type: Number, required: true, default: 0 }
});

bookSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((total, rating) => total + rating.grade, 0);
    this.averageRating = sum / this.ratings.length;
  }
};

bookSchema.methods.hasUserRated = function(userId) {
  return this.ratings.some(rating => rating.userId.toString() === userId.toString());
};

module.exports = mongoose.model('Book', bookSchema);