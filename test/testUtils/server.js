/* eslint-disable @typescript-eslint/no-var-requires */
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { preparePassport } = require('./preparePassport');

export const getServer = (
  provider,
  ensResolverAddress,
  didRegistryAddress,
  ensRegistryAddress
) => {
  const { passport, LOGIN_STRATEGY } = preparePassport(
    provider,
    ensResolverAddress,
    didRegistryAddress,
    ensRegistryAddress
  );
  const server = express();

  server.use(passport.initialize(), cors({ origin: true, credentials: true }));

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  server.post(
    '/login',
    passport.authenticate(LOGIN_STRATEGY, { session: false }),
    async (req, res) => {
      return res.send({ token: req.user });
    }
  );
  return server;
};
