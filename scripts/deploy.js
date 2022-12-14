const { ethers } = require("hardhat")

async function deploy () {
    
    const MultiSend = await ethers.getContractFactory('multiSend')
    const multiSend = await MultiSend.deploy()

    await multiSend.deployed()
    
}

deploy().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

exports.deploy = deploy