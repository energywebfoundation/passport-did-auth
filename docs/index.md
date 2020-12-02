# Node.js Passport strategy using decentralised identifiers


## Maintainers
**Primary**: 
 - [Mani H.](https://github.com/manihagh>)
 - [Daniel Wojno](https://github.com/dwojno>)
**Team**:
 - [Dmitry Fesenko](https://github.com/JGiter)

## Getting Started

This repository consists of a Node.js Password Strategy and examples which show how the strategy can be used.

The strategy provides verification of the issuance of claims made regarding roles defined in an Ethereum Naming System (ENS).

The examples consists of both client and server components.

### Prerequisities

```
npm version 6+
nodejs version 10+
```

### Building the Passport Strategy
```
npm run build
```

### Running the examples
Two different examples are provided, each using a different server application but the same client application. The two server examples provided are: a NestJS example and an ExpressJS example.

The examples can be started in a single command which builds the passport strategy and starts both the client and respective server.

To run the NestJS example:
```
npm run example:nest
```

To run the ExpressJS example:
```
npm run example:express
```

TODO: Add screenshots of expect result of examples