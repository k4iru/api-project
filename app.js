// so api keys are exposed
require("dotenv").config();
const md5 = require("md5");
const request = require("request");
const cors = require("cors");
const express = require("express");
const app = express();

// spotify api library
const SpotifyWebApi = require("spotify-web-api-node");

// scopes for what api endpoints are allowed for spotify
const scopes = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "playlist-read-private",
];

app.use(cors());

// serve static files in public folder
app.use(express.static("public"));

const lastFM = {
  url: "http://www.last.fm/api/auth/?",
  api: "http://ws.audioscrobbler.com/2.0/",
  apiKey: process.env.LAST_API_KEY,
  sharedSecret: process.env.LAST_SECRET,
  token: null,
};

// wrapper library for spotify
// https://github.com/thelinmichael/spotify-web-api-node
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// create middleware to allow CORS
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin"
  );
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// get access token for spotify
app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// get access token for lastfm
app.get("/lastfm", (req, res) => {
  res.redirect(`${lastFM.url}api_key=${lastFM.apiKey}`);
});

// lastfm callback uri
// create auth session using request
// https://www.last.fm/api/webauth
app.get("/lastfmcallback", (req, res) => {
  lastFM.token = req.query.token;

  let api_sig = md5(
    `api_key${lastFM.apiKey}methodauth.getSessiontoken${lastFM.token}${lastFM.sharedSecret}`
  );

  payload = {
    api_key: lastFM.apiKey,
    method: "auth.getSession",
    token: lastFM.token,
    api_sig: api_sig,
  };

  //console.log(api_sig);
  let r = request.get(lastFM.api, (params = payload));
  console.log(r);
  res.send("okay");
});

//
app.get("/", (req, res) => {
  if (req.query.token) {
    lastFM.token = req.query.token;
  }
  const error = req.query.error;
  const code = req.query.code;
  console.log(code);

  if (error) {
    console.log("callback error:", error);
    res.send(`callack error: ${error}`);
    return;
  }
  console.log("test");

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
      //res.send("Success! You can now close the window.");
      res.end();

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

// endpoint for front end. make api call and do stuff with data
app.get("/test", (req, res) => {
  (async () => {
    const me = await spotifyApi.getMe();
    res.res.json(me);
  })().catch((e) => {
    console.error(e);
  });
});

// listen
app.listen(process.env.PORT, () => {
  console.log(`listening at port ${process.env.PORT}`);
});
