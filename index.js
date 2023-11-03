const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  path = require('path');

const app = express();
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a'
})

// load static files from public folder
app.use(express.static('public'));

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// create a movies array
let topMovies = [
  {
    title: "Schindlers Liste",
    director: "Steven Spielberg",
    year: "1994"
  },
  {
    title: "Chihiros Reise ins Zauberland",
    director: "Hayao Miyazaki",
    year: "2003"
  },
  {
    title: "La Vita e bella",
    director: "Roberto Benigni",
    year: "1997"
  },
  {
    title: "Ponyo",
    director: "Hayao Miyazaki",
    year: "2008"
  },
  {
    title: "Clockwork Orange",
    director: "Stanley Kubrick",
    year: "1994"
  },
  {
    title: "Inglourious Basterds",
    director: "Quentin Tarantino",
    year: "2009"
  },
  {
    title: "The Silence of the Lambs",
    director: "Jonathan Demme",
    year: "1991"
  },
  {
    title: "Shutter Island",
    director: "Martin Scorsese",
    year: "2010"
  },
  {
    title: "Joker",
    director: "Todd Phillips",
    year: "2019"
  },
  {
    title: "Django Unchained",
    director: "Quentin Tarantino",
    year: "2012"
  }
];

// route handler for localhost:8080
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// getting the movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke');
});


app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});