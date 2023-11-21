const mongoose = require('mongoose');
// bcrypt for hashing
const bcrypt = require('bcrypt');

const movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Descrition: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

const userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Email: {type: String, required: true},
  Password: {type: String, required: true},
  BirthDay: {type: String},
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Movie'}]
});

// hashing submitted passwords
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Comparing submitted hashed password with hashed passwords stored in db
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;