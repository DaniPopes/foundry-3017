import { HardhatUserConfig, task } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: "0.8.16",
    defaultNetwork: "mainnet",
    networks: {
        mainnet: {
            url: "http://localhost:8544",
            accounts: [
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
                "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
            ],
        },
    },
};

export default config;
