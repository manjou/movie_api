const express = require('express'),
  bodyParser =  require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  path = require('path');

const app = express();

app.use(bodyParser.json());

// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a'
})

// load static files from public folder
app.use(express.static('public'));

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));


// create users array
let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["The Fountain"]
  }
]


// create a movies array
let movies = [
  {
    Title: "Schindlers Liste",
    Description: "Schindler's List is a 1993 American epic historical drama film directed and produced by Steven Spielberg. The film is based on the 1982 novel Schindler's Ark by Australian novelist Thomas Keneally. The movie follows Oskar Schindler, a German industrialist who saved more than a thousand mostly Polish-Jewish refugees from the Holocaust by employing them in his factories during World War II. Schindler's List is a powerful story whose lessons of courage and faith continue to inspire generations",
    Genre: {
      Name: "Historical Drama",
      Description: "Historical drama is a genre of film that fictionalizes real-life events, people, and places, often with a focus on a particular period in history. Historical dramas aim to provide a realistic portrayal of the past, often with an emphasis on accuracy and attention to detail."
    },
    Director: {
      Name: "Steven Spielberg",
      Bio: "Steven Spielberg is an American film director, producer, and screenwriter. He was born on December 18, 1946, in Cincinnati, Ohio. He is known for his diverse films, which range from science-fiction fare, including such classics as Close Encounters of the Third Kind and E.T.: The Extra-Terrestrial, to historical dramas, notably Schindler’s List and Saving Private Ryan.",
      Year: 1946
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "1994"
  },
  {
    Title: "Spirited Away",
    Description: "Spirited Away is a Japanese animated fantasy film directed by Hayao Miyazaki. The movie follows the story of a young girl named Chihiro who becomes trapped in a strange new world of spirits and must call upon the courage she never knew she had to free herself and her family.",
    Genre: {
      Name: "fantasy/adventure",
      Description: "Fantasy/adventure is a genre that combines elements of fantasy, such as magic and mythical creatures, with adventure, such as quests and journeys to new and exciting places. Examples include The Lord of the Rings, Spirited Away, and Alice in Wonderland",
    },
    Director: {
      Name: "Hayao Miyazaki",
      Bio: "Hayao Miyazaki is a Japanese animator, filmmaker, and manga artist. He co-founded Studio Ghibli, a film and animation studio, and has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films. Miyazaki has been described as combining elements of Walt Disney, Steven Spielberg, and Orson Welles. He has won numerous awards, including an Honorary Academy Award for his impact on animation and cinema. Miyazaki's films often incorporate themes of anti-war, environmentalism, and self-discovery",
      Year: "1941"
    },
    ImageURL: "https://www.imdb.com/title/tt0245429/mediaviewer/rm4207852801/?ref_=tt_ov_i",
    Featured: true,
    Year: "2003"
  },
  {
    Title: "La Vita e bella",
    Description: "",
    Genre: {
      Name: "Drama",
      Description: "Drama is a genre of storytelling in film, television, and literature that is meant to be performed in front of an audience. It is plot-driven and often features characters in conflict at a crucial moment in their lives. Dramas can be serious or comedic and often deal with emotional themes such as addiction, infidelity, poverty, and corruption",
    },
    Director: {
      Name: "Roberto Benigni",
      Bio: "",
      Year: ""
    },
    ImageURL: "",
    Featured: true,
    Year: "1997"
  },
  {
    Title: "Ponyo",
    Description: "",
    Genre: {
      Name: "Fantasy",
      Description: ""
    },
    Director: {
      Name: "Hayao Miyazaki",
      Bio: "",
      Year: ""
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "2008"
  },
  {
    Title: "Clockwork Orange",
    Description: "",
    Genre: {
      Name: "",
      Description: "",
    },
    Director: {
      Name: "Stanley Kubrick",
      Bio: "",
      Year: ""
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "1994"
  },
  {
    Title: "Inglourious Basterds",
    Description: "",
    Genre: {
      Name: "Comedy-Drama",
      Description: ""
    },
   Director: {
      Name: "Quentin Tarantino",
      Bio: "",
      Year: ""
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "2009"
  },
  {
    Title: "The Silence of the Lambs",
    Description: "",
    Genre: {
      Name: "",
      Description: ""
    },
      Director: {
      Name: "Jonathan Demme",
      Bio: "",
      Year: ""
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "1991"
  },
  {
    Title: "Shutter Island",
    Description: "",
    Genre: {
      Name: "Drama/neo-noir psychological thriller",
      Description: ""
    },
    Director: {
      Name: "Martin Scorsese",
      Bio: "",
      Year: ""
    },
    ImageURL: "",
    Featured: false,
    Year: "2010"
  },
  {
    Title: "Joker",
    Description: "The movie Joker is a psychological thriller and drama film based on DC Comics characters. It follows the story of Arthur Fleck, a failed clown and aspiring stand-up comic whose descent into mental illness and nihilism inspires a violent countercultural revolution against the wealthy in a decaying Gotham City. The film has been praised for its groundbreaking comic book adaptation, cinematography, and performances, but has also been criticized for its sympathetic portrayal of a homicidal maniac",
    Genre: {
      Name: "Psychological thriller",
      description: ""
    },
    Director: {
      Name: "Todd Phillips",
      Bio: "",
      Year: ""
    },
    ImageURL: "",
    Featured: false,
    Year: "2019"
  },
  {
    Title: "Django Unchained",
    Description: "",
    Genre: {
      Name: "Drama/Western Drama",
      Description: ""
    },
    Director: {
      Name: "Quentin Tarantino",
      Bio: "",
      Year: ""
    },
    ImageURL: "",
    Featured: true,
    Year: "2012"
  }
];

// route handler for localhost:8080
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

// CREATE  Create a new User
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }  else {
    res.status(400).send('users need ')
  }
})

// Update User data
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user');
  }
})

// CREATE Add Users favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
})

// DELETE Users favorite movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).json(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
})

// DELETE User
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).json(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user');
  }
})


// getting the movies / READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// getting a movie by name / READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('There is no movie with this title.')
  }
})

// getting a movie by genre / READ
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('There is no such genre.')
  }
})

// getting a movie by director / READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('There is no such Director.')
  }
})



// Read/GET the documentation file
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