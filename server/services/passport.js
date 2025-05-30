const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
require("../models/user");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          done(null, existingUser);
        } else {
          new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("LinkedIn callback triggered");
      console.log("Profile:", profile);

      User.findOne({ linkedinId: profile.id }).then((existingUser) => {
        if (existingUser) {
          return done(null, existingUser);
        }

        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        return new User({
          linkedinId: profile.id,
          name: profile.displayName,
          email,
        })
          .save()
          .then((user) => done(null, user));
      });
    }
  )
);

const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"],
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }).then((existingUser) => {
        if (existingUser) {
          return done(null, existingUser);
        }
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        new User({
          facebookId: profile.id,
          name: profile.displayName,
          email,
        })
          .save()
          .then((user) => done(null, user));
      });
    }
  )
);
