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


// CREATE  Create a new User
/* We´ll expect JSON in this format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then ((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })  
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// GET all users
app.get('/users', async (req, res) => {
  await Users.find()
    .then ((users) => {
      res.status(201).json(users);
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
});

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
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
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

});

// CREATE / PUSH - Add a movie to Users list of favorite movies
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { favoriteMovies: req.params.MovieID }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// DELETE / PULL -  Delete a movie from the Users list of favorite movies
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { favoriteMovies: req.params.MovieID }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// DELETE User
app.delete('/users/:Username', async (req, res) => {
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
});



// GET all movies
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then ((movies) => {
      res.status(201).json(movies);
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
});

// getting a movie by title / READ
app.get('/movies/:Title', async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// getting a movie by Genre / READ
app.get('/movies/genre/:Genre', async (req, res) => {
  await Movies.find({ "Genre.Name": req.params.Genre.Name })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// getting a movie by director / READ
app.get('/movies/director/:Director', async (req, res) => {
  await Movies.find({ "Director.Name": req.params.Director.Name })
    .then((movies) => {
      res.json(movies);
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