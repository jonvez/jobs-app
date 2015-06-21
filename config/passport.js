var passport = require('passport');
//todo replace with an externalized strategy
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var User = mongoose.model('User');

passport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({ username: username }, function(err, user){
      if(err){ return done(err); }
      if(!user){
        return done(null, false, {message: 'Incorrect credentials'});
      }
      if (!user.validPassword(password)){
        //todo remove
        return done(null, false, {message: 'Incorrect password'});
      }
      return done(null, user);
    });
  }
));