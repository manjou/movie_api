const express = require('express'),
  bodyParser =  require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  mongoose = require('mongoose'),
  path = require('path');
  require('dotenv').config();

const app = express();

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
      Name: "Comedy-Drama",
      Description: "Comedy-drama is a genre that combines elements of comedy and drama. It equally balances the elements of comedy and drama, often dealing with grounded characters and situations. The aim of comedy is to make people laugh, while drama aims to evoke emotions such as sadness, fear, or anger. Comedy-drama typically involves realistic situations and circumstances, relatable and unpredictable characters, and grounded narratives with character-driven plots. The ratio between the drama and comedy can vary, but most of the time there is an equal measure of both, with neither side dominating.",
    },
    Director: {
      Name: "Roberto Benigni",
      Bio: "Roberto Benigni was born on October 27, 1952, in Manciano La Misericordia, Castiglion Fiorentino, Tuscany, Italy. He is an actor, writer, and director, known for his work in Life Is Beautiful (1997), The Tiger and the Snow (2005), and Down by Law (1986). He has been married to Nicoletta Braschi since December 26, 1991.",
      Year: "1952"
    },
    ImageURL: "https://i.pinimg.com/originals/1c/6d/1f/1c6d1fffdd74baffca5fa155ebc32f72.jpg",
    Featured: true,
    Year: "1997"
  },
  {
    Title: "Ponyo",
    Description: "Ponyo is a 2008 Japanese animated fantasy film written and directed by Hayao Miyazaki. The story follows a Pyoung boy named Sosuke who develops a relationship with Ponyo, a young goldfish princess who longs to become a human after falling in love with him. The film features an outstanding roster of voice talent and is a visually stunning fairy tale that's a sweetly poetic treat for children of all ages. Ponyo is loosely based on Hans Christian Andersen's Little Mermaid tale and is one of Miyazaki's most kid-friendly films to date, with memorable characters and positive messages.",
    Genre: {
      Name: "Animated Fantasy",
      Description: "Animated fantasy is a genre that combines elements of animation and fantasy. It typically involves imaginative and magical worlds, mythical creatures, and fantastical elements. The genre is often geared towards children and families, but can also appeal to adults. Examples of animated fantasy films include Ponyo, Spirited Away, The Lion King, and Frozen."
    },
    Director: {
      Name: "Hayao Miyazaki",
      Bio: "Hayao Miyazaki is a Japanese animator, filmmaker, and manga artist. He co-founded Studio Ghibli, a film and animation studio, and has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films. Miyazaki has been described as combining elements of Walt Disney, Steven Spielberg, and Orson Welles. He has won numerous awards, including an Honorary Academy Award for his impact on animation and cinema. Miyazaki's films often incorporate themes of anti-war, environmentalism, and self-discovery",
      Year: "1941"
    },
    ImageURL: "https://fesapusewebsite.blob.core.windows.net/fathom/ponyo-1000x1480-r2-3c7dd4adc4c5119cdacef777caf4657a.jpg",
    Featured: true,
    Year: "2008"
  },
  {
    Title: "Clockwork Orange",
    Description: "A Clockwork Orange is a 1971 dystopian crime film directed by Stanley Kubrick. The film follows the story of a young delinquent named Alex and his gang, who commit violent crimes and undergo an experimental psychological conditioning technique to reform them. The film employs disturbing, violent images to comment on psychiatry, juvenile delinquency, youth gangs, and other social, political, and economic subjects in a dystopian near-future Britain. The film is a cold, dystopian nightmare with a very dark sense of humor and has been the subject of much debate and analysis over the years.",
    Genre: {
      Name: "Dystopian Crime",
      Description: "Dystopian crime is a subgenre of dystopian fiction that combines elements of crime and detective fiction. It typically involves a bleak, oppressive society in which crime is rampant and the government or other authority figures use extreme measures to maintain control. The genre often explores themes of social injustice, corruption, and the struggle for freedom and individuality. Examples of dystopian crime films include A Clockwork Orange, Blade Runner, and Escape from New York.",
    },
    Director: {
      Name: "Stanley Kubrick",
      Bio: "Stanley Kubrick was an American film director, producer, screenwriter, and photographer. He was born on July 26, 1928, in New York City and is widely considered one of the greatest filmmakers of all time. Kubrick's films spanned a number of genres and are known for their intense attention to detail, innovative cinematography, extensive set design, and dark humor. He was a perfectionist who assumed direct control over most aspects of his filmmaking, cultivating an expertise in writing, editing, color-timing, promotion, and exhibition. Kubrick was famous for the painstaking care taken in researching his films and staging scenes, performed in close coordination with his actors, crew, and other collaborators.",
      Year: "1928"
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "1971"
  },
  {
    Title: "Inglourious Basterds",
    Description: "Inglourious Basterds is a 2009 dystopian crime film directed by Quentin Tarantino. The film follows a group of Jewish-American guerrilla soldiers led by Lt. Aldo Raine, who plan to assassinate Nazi leaders in a cinema in Paris during World War II. The film features an ensemble cast, including Brad Pitt, Christoph Waltz, and Mélanie Laurent, and is known for its non-linear narrative, stylized violence, and dark humor. The film was inspired by the 1978 war film The Inglorious Bastards and has been praised for its performances, direction, and screenplay.",
    Genre: {
      Name: "Dystopian Crime",
      Description: "Dystopian crime is a subgenre of dystopian fiction that combines elements of crime and detective fiction. It typically involves a bleak, oppressive society in which crime is rampant and the government or other authority figures use extreme measures to maintain control. The genre often explores themes of social injustice, corruption, and the struggle for freedom and individuality. Examples of dystopian crime films include A Clockwork Orange, Blade Runner, and Escape from New York."
    },
   Director: {
      Name: "Quentin Tarantino",
      Bio: "Quentin Tarantino is an American film director, screenwriter, producer, cinematographer, and actor. He was born on March 27, 1963, in Knoxville, Tennessee. Tarantino is known for his stylized violence, extended dialogue, and references to popular culture. He has directed and written several critically acclaimed and commercially successful films, including Pulp Fiction, Kill Bill, Inglourious Basterds, Django Unchained, and The Hateful Eight. Tarantino's films are noted for their neo-noir violence, razor-sharp dialogue, and fascination with film and pop culture.",
      Year: "1963"
    },
    ImageURL: "https://www.imdb.com/title/tt0108052/mediaviewer/rm3260118016?ref_=ttmi_mi_all_pos_31",
    Featured: true,
    Year: "2009"
  },
  {
    Title: "The Silence of the Lambs",
    Description: "The Silence of the Lambs is a 1991 dystopian crime film directed by Jonathan Demme. The film follows FBI trainee Clarice Starling as she seeks the help of incarcerated cannibalistic serial killer Dr. Hannibal Lecter to catch another notorious serial killer known as Buffalo Bill. The film is known for its gripping narrative, sharp dialogue, and chilling performances by Jodie Foster and Anthony Hopkins. The Silence of the Lambs is a classic thriller that delves into the depths of human darkness, examining the intricate dynamics of power, manipulation, and obsession.",
    Genre: {
      Name: "Dystopian Crime",
      Description: "Dystopian crime is a subgenre of dystopian fiction that combines elements of crime and detective fiction. It typically involves a bleak, oppressive society in which crime is rampant and the government or other authority figures use extreme measures to maintain control. The genre often explores themes of social injustice, corruption, and the struggle for freedom and individuality. Examples of dystopian crime films include A Clockwork Orange, Blade Runner, and Escape from New York."
    },
      Director: {
      Name: "Jonathan Demme",
      Bio: "Jonathan Demme was an American film director, producer, and screenwriter. He was born on February 22, 1944, in Baldwin, New York, and died on April 26, 2017, in New York City. Demme was best known for directing The Silence of the Lambs, which won him the Academy Award for Best Director. He also directed several critically acclaimed films, including Something Wild, Married to the Mob, Philadelphia, Rachel Getting Married, and Stop Making Sense. Demme was known for his character-driven films, and his work often dealt with social issues.",
      Year: "1944"
    },
    ImageURL: "https://originalvintagemovieposters.com/wp-content/uploads/2010/07/Silence-of-the-lambs.jpg",
    Featured: true,
    Year: "1991"
  },
  {
    Title: "Shutter Island",
    Description: "Shutter Island is a 2010 American post-apocalyptic psychological horror thriller film directed by Martin Scorsese. The film follows U.S. Marshal Teddy Daniels and his partner Chuck Aule as they investigate the disappearance of a patient on a remote island. The film explores themes of mental health, trauma, and the nature of reality, creating a suspenseful and tense atmosphere throughout. The film features an ensemble cast, including Leonardo DiCaprio, Mark Ruffalo, and Ben Kingsley, and has been praised for its intricate plot, atmospheric visuals, and thought-provoking themes.",
    Genre: {
      Name: "Post-apocalyptic psychological horror thriller",
      Description: "Post-apocalyptic psychological horror thriller is a subgenre of dystopian fiction that combines elements of horror, psychological thriller, and post-apocalyptic fiction. It typically involves a bleak, oppressive society in which characters face psychological trauma, mental health issues, and supernatural or horrific elements. The genre often explores themes of survival, trauma, and the struggle for sanity in a world gone mad. Examples of post-apocalyptic psychological horror thriller films include Shutter Island, The Road, and 28 Days Later."
    },
    Director: {
      Name: "Martin Scorsese",
      Bio: "Martin Scorsese is an American film director, producer, screenwriter, and actor. He was born on November 17, 1942, in New York City. Scorsese is known for his gritty, meticulous filmmaking style and has directed and written several critically acclaimed and commercially successful films, including Taxi Driver, Raging Bull, Goodfellas, The Departed, and The Irishman. He has received many accolades, including an Academy Award, four BAFTA Awards, three Emmy Awards, a Grammy Award, three Golden Globe Awards, and two Directors Guild of America Awards.",
      Year: "1942"
    },
    ImageURL: "https://www.vintagemovieposters.co.uk/wp-content/uploads/2015/01/IMG_0916.jpg",
    Featured: false,
    Year: "2010"
  },
  {
    Title: "Joker",
    Description: "The movie Joker is a psychological thriller and drama film based on DC Comics characters. It follows the story of Arthur Fleck, a failed clown and aspiring stand-up comic whose descent into mental illness and nihilism inspires a violent countercultural revolution against the wealthy in a decaying Gotham City. The film has been praised for its groundbreaking comic book adaptation, cinematography, and performances, but has also been criticized for its sympathetic portrayal of a homicidal maniac",
    Genre: {
      Name: "Psychological thriller",
      description: "Psychological thriller is a genre that combines elements of thriller and psychological fiction. It deals with psychological narratives in a thriller or suspenseful setting, often incorporating elements of mystery, drama, action, and paranoia. The genre emphasizes the mental states of its characters, their perceptions, thoughts, and distortions, and their struggle to grasp reality. Psychological thrillers often involve mind games, manipulation, and psychological warfare between characters, exploring dark and taboo themes such as mental illness, obsession, violence, and trauma.",
    },
    Director: {
      Name: "Todd Phillips",
      Bio: "Todd Phillips is an American film director, producer, and screenwriter. He was born on December 20, 1970, in New York City. Phillips is known for directing and producing several successful films, including Road Trip, The Hangover film series, Due Date, and Joker. He has received several accolades for his work, including an Academy Award nomination for Best Director for Joker. Phillips is known for his dark humor and his ability to create compelling characters and stories that resonate with audiences.",
      Year: "1970"
    },
    ImageURL: "https://thejournalix.com/wp-content/uploads/2019/10/Joker-Official-Images-Dolby-Cinema-Theaters-Poster-01.jpg",
    Featured: false,
    Year: "2019"
  },
  {
    Title: "Django Unchained",
    Description: "Django Unchained is a 2012 American post-apocalyptic Western film directed by Quentin Tarantino. The film follows a freed slave named Django and a German bounty hunter named Dr. King Schultz as they set out to rescue Django's wife from a brutal plantation owner in Mississippi. The film is known for its stylized violence, dark humor, and memorable performances by Jamie Foxx, Christoph Waltz, and Leonardo DiCaprio. The genre of Django Unchained is Western, Drama, and Action.",
    Genre: {
      Name: "Western Drama",
      Description: "Western drama is a genre that combines elements of Western and drama. It typically involves a setting in the American Old West, featuring cowboys, gunslingers, and outlaws, and explores themes of justice, morality, and survival. The genre often emphasizes character development, relationships, and interpersonal conflicts, and can incorporate elements of romance, tragedy, and action. Examples of Western drama films include Django Unchained, The Magnificent Seven, and Unforgiven."
    },
    Director: {
      Name: "Quentin Tarantino",
      Bio: "Quentin Tarantino is an American film director, screenwriter, producer, actor, and author. He was born on March 27, 1963, in Knoxville, Tennessee. Tarantino's films are characterized by stylized violence, extended dialogue including a pervasive use of profanity, and references to popular culture. He has directed and written several critically acclaimed and commercially successful films, including Pulp Fiction, Kill Bill, Inglourious Basterds, Django Unchained, and The Hateful Eight. Tarantino's films are known for their neo-noir violence, razor-sharp dialogue, and fascination with film and pop culture.",
      Year: "1963"
    },
    ImageURL: "https://originalvintagemovieposters.com/wp-content/uploads/2020/05/Django-5980-scaled-1030x1536.jpg",
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


// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });