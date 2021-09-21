import passport from 'passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { LoginStrategyOptions, LoginStrategy } from '../../lib/LoginStrategy';

export const LOGIN_STRATEGY = 'login'
export const private_pem_secret =  `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Ir9KTl66IzS5pQclFnvpP8+eTWwiVtqONPUn17359cpfLAS
b4OcRPkBfoBu9ecLnsYl+dfvyOxGI0risdDCiRHpSOrXhbfUhvYZXDSrpO4lFk10
UE35d//YawCs3GEJ1KEdyYvafFGjhzkn4rqh26YlTguLkNce6oxGh0axkcxSm2pd
jgRi+FHAlbTZ19Zr7vMcai0eljT0duDk3wNb79lDvsCL9vNfL8Lv4UbHfDxNiyEv
oBiN9U4GeWH+58Ofmj7SL9H8aDtEMfmZI5qcAYbNmwbyp463E9KMjrbNb0IASujk
wvWtfA76yp9epXlJ3FyiUJt95PXlvP26zfuJhQIDAQABAoIBACUoLpVSzYhz1vwI
ddMk9yMB64KzQ0ImDJYVgDPpOuiPGLBDuvUtkQFlEJQWlC6yPQrMKWYLyIiXOKP/
Kscd+BtuGo/IcCA+MdreLISWSeL4H5mKsWfBjOqJpmjiVOprS9Ib5u/LQGGYNjfY
wjeOo1o8jzcJrZNgEP0fg02FFgxw9dZnBrd/zMW+0LL1Wgn/XMn30kxjorcGeN+H
PNjP5mBTSslU9apeJr/hwZ43vAhls7fRONpAgyAv8WGUDaBvE7AJvEEbdaxtHmko
e+rvlQGzChhcizeZKygeeOAFpgOK57YOOXQvfaZR/PCWypPpmaUKIJrKTFfOxb8O
92365OECgYEA+Dj5UBO/u4OAKu1pG58SRT80LaA1V9rbanrvzKdWeDa1C4FpC+q7
LaYQkO7YsZGVnga5lXUhr2ep8SigMlNHr6TcRiHlF+BiCUq1fcFgi4FWNoKmSsec
IYps/S5E1InvKiMIiiS7ERG7parziA/O9aiUwKMaD1u8C8ZkE/bkNz0CgYEA1xO9
TLy08KWQQ9J5t3CTEbhvoT25nv34kugvsyCeEK7pFvfUAOJ1mTaNTy9ChKvCMm6+
4vyyqEFpYbqo3iFIb79sDjIEglDvVR4kiRnvLN0Odb2qkaQtA/VxjWSOKj3DtvtD
ewirIC3plw6Iczvtxm5ouD6IAYIqArNjpMI2f+kCgYEA1yRymsBzR3CDzzE1D9bA
/Dn63Kzmbz5nPRRO8f/8B3fLVayVwtlx4O/1ndkXAlkf5/cGNY9vYdukxTwkFVpv
YMKwlSzdpuM5tboGMnhAWMoCUn7M6TW3kq6rJopK6DihjdENnsaVSQcosD/Kkpy5
Ed1LCOiVNsiY5U/QACnWxjUCgYEAomh1eYzF1TIwTgaRgsOvSqJLKSbDFBwTqFtM
KadntJFf0cgyfriCtL9M1Y6KXESW0B5wZlcLUaKTQQkCmznmyPtzTQTYAs+66jto
u16qDOagFKi0NGYU1/hvVqWn9J3PPE1gF3fkQNhqm3aN8vY+Bqk4ymftq7Xuozty
8ub04IECgYBtA+38cogUmawHyehzfKys0808CUqSCEuWa8BjfFWCb+KwuKYepsC3
BvHScFOKHrnC31adVv5sShpVqfTx7muLT5QH9fsEEPO+BF4zzry5iTOHFh65fkE7
HMYR54AB/HvOVRq/GYFVjhJdRRWRp/C4m7JJUTZgS0WXsYe8I7W7nw==
-----END RSA PRIVATE KEY-----`

const public_pem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Ir9KTl66IzS5pQclFnv
pP8+eTWwiVtqONPUn17359cpfLASb4OcRPkBfoBu9ecLnsYl+dfvyOxGI0risdDC
iRHpSOrXhbfUhvYZXDSrpO4lFk10UE35d//YawCs3GEJ1KEdyYvafFGjhzkn4rqh
26YlTguLkNce6oxGh0axkcxSm2pdjgRi+FHAlbTZ19Zr7vMcai0eljT0duDk3wNb
79lDvsCL9vNfL8Lv4UbHfDxNiyEvoBiN9U4GeWH+58Ofmj7SL9H8aDtEMfmZI5qc
AYbNmwbyp463E9KMjrbNb0IASujkwvWtfA76yp9epXlJ3FyiUJt95PXlvP26zfuJ
hQIDAQAB
-----END PUBLIC KEY-----`

const jwtOptions = {
    secretOrKey: public_pem,
    algorithms: ['RS256'],
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          if (req && req.cookies) {
            return req.cookies.auth;
          }
          return undefined;
        },
        (req) => {
          if (req && req.body && req.body.identity) {
            return req.body.identity.token;
          }
          return undefined;
        },
      ]),
}

export const preparePassport = (didRegistryAddress : string) => {
  const loginStrategyOptions : LoginStrategyOptions = {
    jwtSecret: private_pem_secret,
    name: LOGIN_STRATEGY,
    rpcUrl: `http://localhost:8544`,
    didContractAddress: didRegistryAddress
  }
  const loginStrategy = new LoginStrategy(loginStrategyOptions);
  
  passport.use(loginStrategy);
  passport.use(new Strategy(jwtOptions, (_payload, _done) => {
      return _done(null, _payload);
  }));
  passport.serializeUser((_user, done) => {
      done(null, _user);
  });
  passport.deserializeUser(function (user, done) {
      done(null, user);
  });

  return { passport, LOGIN_STRATEGY, loginStrategy };
}