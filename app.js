// so api keys are exposed
require("isomorphic-fetch");
require("dotenv").config();
const md5 = require("md5");
//const request = require("request");
const https = require("https");
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

const TM = {
  url: "https://app.ticketmaster.com/discovery/v2/",
  apiKey: process.env.TM_API_KEY,
  secret: process.env.TM_SECRET,
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

// spotify callback
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

// endpoint for front end. make api call and do stuff with data
app.get("/getMe", (req, res) => {
  (async () => {
    const me = await spotifyApi.getMe();
    res.json(me);
  })().catch((e) => {
    console.error(e);
  });
});

// ticketmaster events
app.get("/events", (req, res) => {
  let data = fetch(
    "https://app.ticketmaster.com/discovery/v2/events.json?apikey=jhsGy1zO4fzWEVjVOhGFStdkPyxPyhn8"
  )
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Something went wrong! Status Code: " + res.status);
        return;
      }
      // parse body as json with a promise
      response.json().then(function (data) {
        // if successful do stuff
        res.json(data);
      });
    })
    .catch(function (err) {
      console.log("Fetch Error: ", err);
    });
});

// listen
app.listen(process.env.PORT, () => {
  console.log(`listening at port ${process.env.PORT}`);
});
