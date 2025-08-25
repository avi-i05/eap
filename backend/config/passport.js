const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const axios = require("axios");
const SERVER_URL = process.env.SERVER_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Ensure we have a valid email
          if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            console.error('No email found for Google user:', profile.displayName);
            return done(new Error('Email is required for registration'), null);
          }
          
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
          });
          await user.save();
          
          // Log the registration for new Google users
          try {
            const logAction = require("../utils/logAction");
            await logAction(user._id, user.username, "Google Registration");
            console.log('Google registration logged for user:', user.username);
          } catch (logError) {
            console.error('Failed to log Google registration:', logError.message);
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = "";
        try {
          const emailRes = await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${accessToken}`,
              "User-Agent": "node.js",
            },
          });

          if (emailRes.data && Array.isArray(emailRes.data)) {
            const primaryEmail = emailRes.data.find(
              (e) => e.primary && e.verified
            );
            if (primaryEmail) {
              email = primaryEmail.email;
            }
          }
        } catch (emailError) {
          console.error('Failed to fetch GitHub emails:', emailError.message);
          // If we can't get emails from GitHub API, try to use profile email
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
          }
        }

        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          // Ensure we have a valid email
          if (!email) {
            console.error('No email found for GitHub user:', profile.username);
            return done(new Error('Email is required for registration'), null);
          }
          
          user = new User({
            githubId: profile.id,
            username: profile.username,
            email: email,
            role: "user",
          });
          await user.save();
          
          // Log the registration for new GitHub users
          try {
            const logAction = require("../utils/logAction");
            await logAction(user._id, user.username, "GitHub Registration");
            console.log('GitHub registration logged for user:', user.username);
          } catch (logError) {
            console.error('Failed to log GitHub registration:', logError.message);
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
