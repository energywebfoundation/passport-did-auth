const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { preparePassport } = require("./preparePassport");

const { passport, LOGIN_STRATEGY } = preparePassport();

export const server = express();

server.use(passport.initialize(), cors({ origin: true, credentials: true }));

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

 server.post("/login", passport.authenticate(LOGIN_STRATEGY), async (req, res) => {
  return res.send({ token: req.user });
});

server.listen(3333, () => {
  console.log("App is ready and listening on port 3333");
});