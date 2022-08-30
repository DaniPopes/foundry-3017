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
