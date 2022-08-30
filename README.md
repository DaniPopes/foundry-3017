# foundry 3017

Reproduction environment for [foundry-rs/foundry#3017](https://github.com/foundry-rs/foundry/issues/3017).

## Reproduce

```sh
# Install dependencies
yarn install

# Run anvil hardhat chain id (31337)
yarn anvil
# or
anvil --fork-url $ETH_RPC_URL --chain-id 31337

# Run hardhat test
yarn test
```
