import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { findOrCreateUser, AuthenticatedUser } from '../lib/auth';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'google');
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Microsoft OAuth Strategy
// Note: Using a generic OAuth2 approach since passport-microsoft might need specific configuration
const MicrosoftStrategy = require('passport-microsoft').Strategy;

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      callbackURL: '/auth/microsoft/callback',
      scope: ['user.read'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        // Transform Microsoft profile to match our expected format
        const transformedProfile = {
          id: profile.id,
          displayName: profile.displayName,
          emails: [
            { value: profile.emails?.[0]?.value || profile.userPrincipalName },
          ],
          name: {
            givenName: profile.name?.givenName,
            familyName: profile.name?.familyName,
          },
        };

        const user = await findOrCreateUser(transformedProfile, 'microsoft');
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// JWT Strategy for API authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload: any, done) => {
      try {
        // The payload already contains user info from the token
        const user: AuthenticatedUser = {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          provider: payload.provider,
          providerId: payload.providerId,
        };
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session (though we're using JWT, this is still required)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  // Since we're using JWT, we don't need to deserialize from session
  done(null, { id });
});

export default passport;
