/** @module passport */
const passport = require('passport');

/** @module passport-local */
const LocalStrategy = require('passport-local').Strategy;

/** @module models */
const Models = require('./models.js');

/** @module passport-jwt */
const passportJWT = require('passport-jwt');

/** @type {Object} */
let Users = Models.User;

/** @type {Object} */
let JWTStrategy = passportJWT.Strategy;

/** @type {Object} */
let ExtractJWT = passportJWT.ExtractJwt;

/**
 * Local strategy for authenticating user using username and password
 * @param {string} username - The username of the user
 * @param {string} password - The password of the user
 * @param {function} callback - The callback function
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username})
        .then ((user) => {
          if (!user) {
            console.log('incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, { message: 'Incorrect password '});
          }
          console.log('finished');
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return callback(error);
          }
        })
    }
  )
);

/**
 * JWT strategy for handling JWT
 * @param {object} jwtPayload - The payload of the JWT
 * @param {function} callback - The callback function
 */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
  return await Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));