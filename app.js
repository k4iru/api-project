require("dotenv").config();
const express = require("express");
const app = express();
const SpotifyWebApi = require("spotify-web-api-node");

// scopes for what api endpoints are allowed
const scopes = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "playlist-read-private",
];

// wrapper library for spotify
// https://github.com/thelinmichael/spotify-web-api-node
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// create middleware to allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get("/", (req, res) => {
  res.send("homepage");
});

app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.log("callback error:", error);
    res.send(`callack error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log(
        `Successfully retrieved access token. Expires in ${expires_in} s.`
      );
      res.send("Success! You can now close the window.");

      // auto refresh token
      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body["access_token"];

        console.log("The access token has been refreshed!");
        console.log("access token:", access_token);
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.get("/test", (req, res) => {
  (async () => {
    const me = await spotifyApi.getMe();
    res.send(me);
  })().catch((e) => {
    console.error(e);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`listening at port ${process.env.PORT}`);
});
