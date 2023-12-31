import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github';
import bcrypt from 'bcrypt';
import User from '../model/user.model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done({ message: 'Incorrect username' }, false);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done({ message: 'Incorrect password' }, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/api/auth/google/callback',
      scope: ['email', 'profile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const username = profile.displayName;

        // Get user based on id and email
        let user = await User.findOne({
          $or: [{ googleId }, { email }],
        }).exec();

        if (!user) {
          // User doesn't exist, create a new user
          user = await User.create({
            googleId,
            username,
            email,
          });
        }

        // Pass the user and token to the callback function
        done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const username = profile.username;
        const githubId = profile.id;

        // Get user based on id and email
        let user = await User.findOne({
          $or: [{ githubId }],
        }).exec();

        if (!user) {
          // User doesn't exist, create a new user
          user = await User.create({
            githubId,
            username,
          });
        }

        // Pass the user and token to the callback function
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
