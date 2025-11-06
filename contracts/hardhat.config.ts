import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        // 本地 Hardhat 网络
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        // Ganache 配置 - 根据您的 Ganache 设置调整
        ganache: {
            url: "http://127.0.0.1:8545", // Ganache GUI 默认端口
            chainId: 1337,
            accounts: [
                "0x13ad822197d06d52eebb97729dc6dd4c14610db54b1c56b18088f9618b923948" // 可选，如果需要特定账户
            ]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
