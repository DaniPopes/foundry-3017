import { ethers } from "hardhat";
import { waitForTransaction } from "@gearbox-protocol/devops";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

import {
    contractsByNetwork,
    IBaseRewardPool__factory,
    IBooster__factory,
    IERC20Metadata__factory,
    IERC20__factory,
    IUniswapV2Adapter__factory,
    MAX_INT,
    SupportedToken,
    tokenDataByNetwork,
    WAD,
    ICurvePool3Assets__factory,
} from "@gearbox-protocol/sdk";

describe("Convex pool adapter test", async function () {
    this.timeout(0);

    let deployer: SignerWithAddress;
    let user: SignerWithAddress;

    before(async () => {
        const accounts = (await ethers.getSigners()) as Array<SignerWithAddress>;
        deployer = accounts[0];
        user = accounts[1];
    });

    it(`Anvil doesn't work properly`, async function () {
        let booster = IBooster__factory.connect(contractsByNetwork.Mainnet.CONVEX_BOOSTER, user);
        let basePool = IBaseRewardPool__factory.connect(
            contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
            user
        );

        const curveLPToken = IERC20__factory.connect(tokenDataByNetwork.Mainnet["3Crv"], deployer);

        const pid = await basePool.pid();

        const depositToken = IERC20Metadata__factory.connect(
            tokenDataByNetwork.Mainnet.DAI,
            deployer
        );

        const addressPath = ["WETH", "DAI"].map(
            symbol => tokenDataByNetwork.Mainnet[symbol as SupportedToken]
        );

        const uniswapV2 = IUniswapV2Adapter__factory.connect(
            contractsByNetwork.Mainnet.UNISWAP_V2_ROUTER,
            deployer
        );

        console.log("Converting ETH into DAI");

        // console.log("path", addressPath);
        // console.log("deployer", deployer.address);
        await waitForTransaction(
            uniswapV2.swapExactETHForTokens(
                0,
                addressPath,
                deployer.address,
                Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
                { value: WAD.mul(10) }
            )
        );

        const amountToDeposit = await depositToken.balanceOf(deployer.address);

        const curvePoolAddress = contractsByNetwork.Mainnet.CURVE_3CRV_POOL;

        console.log("Approving curvePool for DAI");

        await waitForTransaction(depositToken.approve(curvePoolAddress, 0));
        await waitForTransaction(depositToken.approve(curvePoolAddress, amountToDeposit));

        const curvePool = ICurvePool3Assets__factory.connect(curvePoolAddress, deployer);

        const amounts = [amountToDeposit, BigNumber.from(0), BigNumber.from(0)] as [
            BigNumber,
            BigNumber,
            BigNumber
        ];

        console.log("Adding liquidity to curvePool");

        await waitForTransaction(curvePool.add_liquidity(amounts, 0));

        const lpTokenBalance = await curveLPToken.balanceOf(deployer.address);

        await waitForTransaction(curveLPToken.transfer(user.address, lpTokenBalance));

        console.log("Approving Convex  Booster for 3CRV");

        await waitForTransaction(curveLPToken.connect(user).approve(booster.address, 0));

        await waitForTransaction(curveLPToken.connect(user).approve(booster.address, MAX_INT));

        let curveLPBalance = await curveLPToken.balanceOf(user.address);

        console.log(`1st call deposit: ${curveLPBalance.toString()}`);
        await waitForTransaction(booster.deposit(pid, curveLPBalance.div(2), false));

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        curveLPBalance = await curveLPToken.balanceOf(user.address);
        console.log(`2nd call deposit: ${curveLPBalance.toString()}`);
        await waitForTransaction(booster.deposit(pid, curveLPBalance.div(2), false));
    });
});
