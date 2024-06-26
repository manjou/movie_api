/**
 * @file server.js
 * @requires express
 * @requires uuid
 * @requires morgan
 * @requires fs
 * @requires mongoose
 * @requires models.js
 * @requires path
 * @requires dotenv
 * @requires express-validator
 * @requires cors
 * @requires auth.js
 * @requires passport
 * @requires passport.js
 */
const express = require('express'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  path = require('path'),
  Movies = Models.Movie,
  Users = Models.User;
  // const history = require('connect-history-api-fallback');

  require('dotenv').config();


// express-validator
const { check, validationResult } = require('express-validator');

/**
 * @type {express.Application}
 */
const app = express();
app.use(express.json());
// app.use(history());
// app.use(express.urlencoded({extended: true}));

// Cross-Origin Resource Sharing (CORS)
const cors = require('cors');

// URL allowed to make API requests
let allowedOrigins = ['https://manjou.github.io', 'http://localhost:5000', 'http://localhost:1234', 'https://moveflix.onrender.com', 'http://localhost:4200', 'https://manjou.github.io/myFlix-Angular-client'];

// CORS middleware function
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){// If a specific origing isnt found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

// connect to the database
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, '0.0.0.0', ()=> {
      console.log('listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })


app.use(express.json());

// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a'
})

// load static files from public folder
app.use(express.static('public'));

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));


// route handler for localhost:8080
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});


// U S E R   ENDPOINTS ================================================

// CREATE  Create a new User
// We´ll expect JSON in this format:
/**
 * @route POST /users
 * @group users - Operations about users
 * @param {string} username.body.required - username
 * @param {string} password.body.required - password
 * @param {string} email.body.required - email
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
app.post(
  '/users',  
  // Validation logic here for request
  // either chaining of methods .not().isEmpty()
  // or use .isLength({min: 5}) - minimum value of 5 characters
  [
    check(
      'Username', 
      'Username is required')
      .isLength({min: 5}),
    check(
      'Username', 
      'Username contains non alphanumeric characters - not allowed.')
      .isAlphanumeric(),
    check(
      'Password', 
      'Password is required')
      .not().isEmpty(),
    check(
      'Email', 
      'Email does not appear to be valid')
      .isEmail()
  ], 
  async (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
  let hashedPassword = Users.hashPassword(req.body.Password);

  await Users.findOne({ Username: req.body.Username })
    .then ((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            BirthDay: req.body.BirthDay,
            FavoriteMovies: req.body.FavoriteMovies
          })
            .then((user) =>{
              res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });  
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * @route GET /users
 * @group users - Operations about users
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
app.get(
  '/users', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Users.find()
      .then ((users) => {
        res.status(201).json(users);
      })
      .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: '+ err);
      });
    }
  );

/**
 * @route GET /users/{id}
 * @group users - Operations about users
 * @param {string} id.path.required - user id
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
app.get(
  '/users/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Users.findOne({ _id: req.params.id })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
          res.status(400).send('User with id ' + req.params.id + ' was not found.');
        } else {
          res.status(200).send(user);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);



/**
 * @route DELETE /users/{id}
 * @group users - Operations about users
 * @param {string} id.path.required - user id
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
app.delete(
  '/users/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Users.findOneAndDelete({ _id: req.params.id })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
          res.status(400).send('User with id ' + req.params.id + ' was not found.');
        } else {
          res.status(200).send(user.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);


/**
 * Update User data, by ID
 * We´ll expect JSON in this format:
 * {
 *   Username: String, (required)
 *   Password: String, (required)
 *   Email: String, (required)
 *   BirthDay: Date
 * }
 * @route PUT /users/:id
 * @group User - Operations about user
 * @param {string} id.path.required - user id
 * @param {User.model} user.body.required - User object that needs to be updated
 * @returns {User.model} 200 - An updated user object
 * @returns {Error}  default - Unexpected error
 */
app.put(
  '/users/:id', 
  [
    // check('Username', 'Username is required').isLength({min: 5}),
    // check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    // check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try{
      let toUpdateUser= {};
      if(req.body.Email == null){
        res.status(500).send('Need to provide at least the Email');
      }
      if(req.body.Username != null){
        toUpdateUser.Username = req.body.Username;
      }
      if(req.body.Password != null){
        let hashedPassword = Users.hashPassword(req.body.Password);
        toUpdateUser.Password = hashedPassword;
      }
      if(req.body.Birthday != null){
        toUpdateUser.BirthDay = req.body.Birthday;
      }
      
      toUpdateUser.Email = req.body.Email;


      console.log('to update uswr:', toUpdateUser);
      console.log('to update id:', req.params.id);

      
      await Users.findOneAndUpdate(
        { _id: req.params.id }, 
        { 
          $set: toUpdateUser
            // {
            //   Username: req.body.Username,
            //   Password: hashedPassword,
            //   Email: req.body.Email,
            //   Birthday: req.body.Birthday
            // }
        },
        { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })

    }catch(error){
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);

/**
 * Add a movie to Users list of favorite movies
 * @route POST /users/:id/movies/:MovieID
 * @group User - Operations about user
 * @param {string} id.path.required - user id
 * @param {string} MovieID.path.required - movie id
 * @returns {User.model} 200 - An updated user object with added favorite movie
 * @returns {Error}  default - Unexpected error
 */
app.post(
  '/users/:id/movies/:MovieID', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
   if(String(req.user._id) !== req.params.id){
    return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { _id: req.params.id }, 
      { $push: { FavoriteMovies: req.params.MovieID }},
      { new: true } // This line makes sure that the updated document is returned
    ) 
    .then((updatedUser) => {
      res.json(updatedUser);
      console.log(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  }
);

/**
 * Delete a movie from the Users list of favorite movies
 * @route DELETE /users/:id/movies/:MovieID
 * @group User - Operations about user
 * @param {string} id.path.required - user id
 * @param {string} MovieID.path.required - movie id
 * @returns {User.model} 200 - An updated user object with deleted favorite movie
 * @returns {Error}  default - Unexpected error
 */
app.delete(
  '/users/:id/movies/:MovieID', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
  //  // CONDITION TO CHECK USER AUTHORIZATION
  //  if(req.user.Username !== req.params.Username){
  //   return res.status(400).send('Permission denied');
  // }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ _id: req.params.id }, {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  }
);



// MOVIES ENDPOINTS ------------------------------------------------------------
/**
 * Get all movies
 * @route GET /movies
 * @group Movie - Operations about movie
 * @returns {Array.<Movie>} 200 - An array of movie info
 * @returns {Error}  default - Unexpected error
 */
app.get(
  '/movies', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Movies.find()
      .then ((movies) => {
        res.status(201).json(movies);
      })
      .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: '+ err);
      });
  }
);

/**
 * Get a movie by title
 * @route GET /movies/:Title
 * @group Movie - Operations about movie
 * @param {string} Title.path.required - movie title
 * @returns {Movie.model} 200 - An movie object
 * @returns {Error}  default - Unexpected error
 */
app.get(
  '/movies/:Title', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get data about a Genre
 * @route GET /movies/genre/:Genre
 * @group Movie - Operations about movie
 * @param {string} Genre.path.required - genre name
 * @returns {Genre.model} 200 - An genre object
 * @returns {Error}  default - Unexpected error
 */
app.get('/movies/genre/:Genre', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.Genre })
    .then((movies) => {
      res.json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * Get data about director, (name, bio, birthyear, deathyear)
 * @route GET /movies/director/:Director
 * @group Movie - Operations about movie
 * @param {string} Director.path.required - director name
 * @returns {Director.model} 200 - An director object
 * @returns {Error}  default - Unexpected error
 */
app.get('/movies/director/:Director', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.Director })
    .then((movies) => {
      res.json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});



/**
 * Get the documentation file
 * @route GET /documentation
 * @returns {File} 200 - The documentation file
 * @returns {Error} default - Unexpected error
 */
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname, headers: {'Content-Type': 'text/html'} });
});

/**
 * Error handling middleware
 * @returns {Error} 500 - Returns error message
 */
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke');
});

