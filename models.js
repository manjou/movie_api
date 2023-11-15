let movieSchema = mongoose.Schema({
  Title: {type String, required: true},
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

let userSchema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  birthday: Date,
  favoriteMovie: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Movie'}]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User, userSchema');

module.exports.Movie = Movie;
module.exports.User = User;