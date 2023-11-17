const mongoose = require('mongoose');

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

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;