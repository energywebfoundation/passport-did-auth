const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { preparePassport } = require("./preparePassport");

export const getServer = (didRegistryAddress) => { 
  const { passport, LOGIN_STRATEGY } = preparePassport(didRegistryAddress);
  const server = express();

  server.use(passport.initialize(), cors({ origin: true, credentials: true }));

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  server.post("/login", passport.authenticate(LOGIN_STRATEGY), async (req, res) => {
    return res.send({ token: req.user });
  });
  return server
}