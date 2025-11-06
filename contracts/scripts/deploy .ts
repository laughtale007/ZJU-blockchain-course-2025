import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 开始部署 EasyBet 系统...");
  
  // 检查网络连接
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`✅ 成功连接到网络: ${network.name}`);
    console.log(`📦 当前区块: ${blockNumber}`);
  } catch (error) {
    console.error("❌ 无法连接到网络，请检查:");
    console.error("   1. Ganache 是否正在运行");
    console.error("   2. 网络配置是否正确");
    console.error("   3. 端口是否被占用");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`📝 部署者地址: ${deployer.address}`);

  try {
    // 1. 部署 BetToken
    console.log("\n1. 📦 部署 BetToken (ERC20)...");
    const BetToken = await ethers.getContractFactory("BetToken");
    const betToken = await BetToken.deploy();
    await betToken.deployed(); // 使用 deployed() 而不是 waitForDeployment()
    const betTokenAddress = await betToken.address;
    console.log(`   ✅ BetToken 部署成功: ${betTokenAddress}`);

    // 2. 部署 TicketNFT
    console.log("\n2. 🎫 部署 TicketNFT...");
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketNFT = await TicketNFT.deploy();
    await ticketNFT.deployed(); // 使用 deployed() 而不是 waitForDeployment()
    const ticketNFTAddress = await ticketNFT.address;
    console.log(`   ✅ TicketNFT 部署成功: ${ticketNFTAddress}`);

    // 3. 部署 EasyBet
    console.log("\n3. 🎲 部署 EasyBet 主合约...");
    const EasyBet = await ethers.getContractFactory("EasyBet");
    const easyBet = await EasyBet.deploy(betTokenAddress, ticketNFTAddress);
    await easyBet.deployed(); // 使用 deployed() 而不是 waitForDeployment()
    const easyBetAddress = await easyBet.address;
    console.log(`   ✅ EasyBet 部署成功: ${easyBetAddress}`);

    // 4. 转移 TicketNFT 所有权给 EasyBet 合约
    console.log("\n4. 🔄 设置 TicketNFT 所有者...");
    const transferTx = await ticketNFT.transferOwnership(easyBetAddress);
    await transferTx.wait();
    console.log("   ✅ 所有权转移成功");

    // 部署摘要
    console.log("\n🎉 部署完成！合约地址:");
    console.log(`   BetToken:    ${betTokenAddress}`);
    console.log(`   TicketNFT:   ${ticketNFTAddress}`);
    console.log(`   EasyBet:     ${easyBetAddress}`);
    console.log(`   部署者:      ${deployer.address}`);

    // 保存地址到文件（可选）
    const addresses = {
      betToken: betTokenAddress,
      ticketNFT: ticketNFTAddress,
      easyBet: easyBetAddress,
      deployer: deployer.address,
      network: network.name
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 合约地址已保存到 deployed-addresses.json");

  } catch (error: any) {
    console.error("\n❌ 部署过程中发生错误:");
    console.error(`   错误信息: ${error.message}`);
    if (error.message.includes("insufficient funds")) {
      console.error("   💡 提示: 部署者账户余额不足，请检查 Ganache 账户");
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 部署脚本执行失败:", error);
  process.exitCode = 1;
});