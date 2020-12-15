# Node.js Passport strategy using decentralised identifiers


## Maintainers
**Primary**: 
 - [Mani H.](https://github.com/manihagh>)
 - [Daniel Wojno](https://github.com/dwojno>)
 
**Team**:
 - [Dmitry Fesenko](https://github.com/JGiter)
 - [John Henderson](https://github.com/jrhender)

## Getting Started

This repository consists of a Node.js Password Strategy and examples which show how the strategy can be used.

The strategy provides verification of the issuance of claims made regarding roles defined in an Ethereum Naming System (ENS).

The examples consists of both server application which demonstrate the use of the strategy.

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
Two server examples are provided: a NestJS example and an ExpressJS example.

The examples can be started in a single command which builds the passport strategy and starts the respective server.

To run the NestJS example:
```
npm run example:nest
```

To run the ExpressJS example:
```
npm run example:express
```

### Client examples
Example clients which demonstrate interaction with the strategy can be found in the [iam-client-lib repo](https://github.com/energywebfoundation/iam-client-lib/tree/develop/examples)