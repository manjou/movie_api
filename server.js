const express = require('express'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  path = require('path'),
  Movies = Models.Movie,
  Users = Models.User;

  require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, ()=> {
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
// // CREATE  Create a new User
// /* We´ll expect JSON in this format:
// {
//   ID: Integer,
//   Username: String,
//   Password: String,
//   Email: String,
//   Birthday: String,
//   FavoriteMovie: Array
// }*/
// app.post('/users',  passport.authenticate('jwt', { session: false }), async (req, res) => {
//   await Users.findOne({ Username: req.body.Username })
//     .then ((user) => {
//       if (user) {
//         return res.status(400).send(req.body.Username + ' already exists');
//       } else {
//         Users
//           .create({
//             Username: req.body.Username,
//             Password: req.body.Password,
//             Email: req.body.Email,
//             BirthDay: req.body.BirthDay,
//             FavoriteMovies: req.body.FavoriteMovies
//           })
//             .then((user) =>{
//               res.status(201).json(user) })
//           .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//           })  
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Error: ' + error);
//     });
// });

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

// Update User data, by Username
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
  '/users/:Username', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    // CONDITION TO CHECK USER AUTHORIZATION
    if(req.user.Username !== req.params.Usernam){
      return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { Username: req.params.Username }, 
      { 
        $set:
          {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          }
      },
      { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
  }
);

// CREATE / PUSH - Add a movie to Users list of favorite movies
app.post(
  '/users/:Username/movies/:MovieID', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
   if(req.user.Username !== req.params.Usernam){
    return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { Username: req.params.Username }, 
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
  '/users/:Username/movies/:MovieID', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
   if(req.user.Username !== req.params.Usernam){
    return res.status(400).send('Permission denied');
  }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
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


// DELETE User
app.delete('
  /users/:Username', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
   // CONDITION TO CHECK USER AUTHORIZATION
   if(req.user.Username !== req.params.Usernam){
    return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
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
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke');
});


// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });