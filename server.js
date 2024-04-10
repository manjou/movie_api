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
  // const history = require('connect-history-api-fallback');

  require('dotenv').config();


// express-validator
const { check, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
// app.use(history());
// app.use(express.urlencoded({extended: true}));

// Cross-Origin Resource Sharing (CORS)
const cors = require('cors');

let allowedOrigins = ['http://localhost:5000', 'http://localhost:1234', 'https://moveflix.onrender.com', 'http://localhost:4200', 'https://manjou.github.io/myFlix-Angular-client'];

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
/* We´ll expect JSON in this format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: String,
  FavoriteMovie: Array
}*/
app.post(
  '/users',  
  // Validation logic here for request
  // either chaining of methods .not().isEmpty()
  // or use .isLenth({min: 5}) - minimum value of 5 characters
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
  // passport.authenticate('jwt', { session: false }), 

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

// GET all users
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

// GET One User by ID

app.get(
  '/users/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
  //  if(req.user.Username !== req.params.Username){
  //   return res.status(400).send('Permission denied');
  //   }
    // CONDITION ENDS
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



// DELETE User
app.delete(
  '/users/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
  //  if(req.user.Username !== req.params.Username){
  //   return res.status(400).send('Permission denied');
  //   }
    // CONDITION ENDS
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


// Update User data, by ID
/* We´ll expect JSON in this format:
{
Username: String,
(required)
Password: String,
(required)
Email: String,
(required)
BirthDay: Date
}*/
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
      // CONDITION TO CHECK USER AUTHORIZATION
      // if(req.user.Username !== req.params.Username){
      //   return res.status(400).send('Permission denied');
      // }
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


      // CONDITION ENDS
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

// CREATE / PUSH - Add a movie to Users list of favorite movies
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

// DELETE / PULL -  Delete a movie from the Users list of favorite movies
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
// GET all movies
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

// getting a movie by title / READ
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

// getting data about a Genre / READ
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

// getting data about director, (name, bio, birthyear, deathyear) / READ
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



// Read/GET the documentation file
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname, headers: {'Content-Type': 'text/html'} });
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke');
});


// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });
