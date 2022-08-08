<p align="center">
  <img src="https://github.com/energywebfoundation/passport-did-auth/actions/workflows/deploy.yml/badge.svg" />
</p>

# Node.js Passport strategy using decentralised identifiers

## Getting Started

This repository consists of a Node.js Password Strategy which provides verification of the issuance of claims made regarding roles defined in an Ethereum Naming System (ENS).

## Token payload structure

Token payload should have following structure

```
{
  claimData: {
    blockNumber: number;
  };
  iss: string;
}
```

where the `iss` is DID of the subject and `blockNumber` is block number (or height) of the most recently mined block.

### Prerequisities

```
npm version 7+
nodejs version 16.10+
```

### Building the Passport Strategy

```
npm run build
```

### Example applications

Example server applications which demonstrate the use of the passport strategy can be found in [this repository](https://github.com/energywebfoundation/iam-client-examples). The repository also contains client examples which leverage the [iam-client-lib](https://github.com/energywebfoundation/iam-client-lib/) to interact with the server applications.

## Active Maintainers

- [John Henderson](https://github.com/jrhender)
- [Dmitry Fesenko](https://github.com/JGiter)
- [Jakub Sydor](https://github.com/Harasz)
- [Ashish Tripathi](https://github.com/nichonien)
