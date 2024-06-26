/** @module mongoose */
const mongoose = require('mongoose');

/** @module bcrypt */
// bcrypt for hashing
const bcrypt = require('bcrypt');

/**
 * @typedef {object} Genre
 * @property {string} Name - The name of the genre
 * @property {string} Description - The description of the genre
 */

/**
 * @typedef {object} Director
 * @property {string} Name - The name of the director
 * @property {string} Bio - The biography of the director
 * @property {string} Birth - The birth date of the director
 * @property {string} Death - The death date of the director
 */

/**
 * @typedef {object} Movie
 * @property {string} Title - The title of the movie
 * @property {string} Description - The description of the movie
 * @property {Genre} Genre - The genre of the movie
 * @property {Director} Director - The director of the movie
 * @property {Array.<string>} Actors - The actors in the movie
 * @property {string} ImagePath - The image path of the movie
 * @property {boolean} Featured - Whether the movie is featured or not
 */
const movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: String,
    Death: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

/**
 * @typedef {object} User
 * @property {string} Username - The username of the user
 * @property {string} Email - The email of the user
 * @property {string} Password - The password of the user
 * @property {Date} BirthDay - The birthday of the user
 * @property {Array.<mongoose.Schema.Types.ObjectID>} FavoriteMovies - The favorite movies of the user
 */
const userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Email: {type: String, required: true},
  Password: {type: String, required: true},
  BirthDay: {type: Date},
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Movie'}]
});

/**
 * Hash the given password
 * @param {string} password - The password to hash
 * @returns {string} The hashed password
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validate the given password against the user's password
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password is valid
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

/** @type {mongoose.Model} */
let Movie = mongoose.model('Movie', movieSchema);

/** @type {mongoose.Model} */
let User = mongoose.model('User', userSchema);

/** @module Movie */
module.exports.Movie = Movie;

/** @module User */
module.exports.User = User;