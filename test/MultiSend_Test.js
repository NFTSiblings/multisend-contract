const { expect } = require('chai')
const { ethers } = require('hardhat')

beforeEach(async () => {

    [owner, address1, address2, address3] = await ethers.getSigners()
    
    MultiSend = await ethers.getContractFactory('multiSend')
    multiSend = await MultiSend.deploy()
    await multiSend.deployed()

})

describe('multiSend Contract Test', () => {

    describe('Ether Transfers', () => {

        beforeEach(async () => {

            amountToAddress1 = ethers.BigNumber.from(ethers.utils.parseEther('0.001'))
            amountToAddress2 = ethers.BigNumber.from(ethers.utils.parseEther('0.002'))
            amountToAddress3 = ethers.BigNumber.from(ethers.utils.parseEther('0.003'))
            amountToBeSent = ethers.BigNumber.from(amountToAddress1.add(amountToAddress2.add(amountToAddress3)))
            
            etherSendArray = []
            etherSendArray.push({
                receiver: address1.address,
                amount: amountToAddress1
            })
            etherSendArray.push({
                receiver: address2.address,
                amount: amountToAddress2
            })
            etherSendArray.push({
                receiver: address3.address,
                amount: amountToAddress3
            })
    
        })

        it('Ether is transfered properly', async () => {

            await expect(multiSend.connect(owner).etherMultiSend(etherSendArray, {value: amountToBeSent}))
            .to.changeEtherBalances([owner, address1, address2, address3], [-amountToBeSent, amountToAddress1, amountToAddress2, amountToAddress3])


        })

        it('Transaction is reverted for improper eth sent', async () => {

            await expect(multiSend.connect(owner).etherMultiSend(etherSendArray, {value: ethers.utils.parseEther('0.05')}))
            .to.be.revertedWith('Invalid Amount')

        })

    })

    describe('ERC20 Token Transfers', () => {

        beforeEach(async () => {

            TestToken = await ethers.getContractFactory('MyToken')
            testToken = await TestToken.deploy()
            await testToken.deployed()

            amountToAddress1 = 100
            amountToAddress2 = 200
            amountToAddress3 = 300
            amountToBeSent = amountToAddress1 + amountToAddress2 + amountToAddress3
            currentOwnerBalance = await testToken.balanceOf(owner.address)
            currentAddress1Balance = await testToken.balanceOf(address1.address)
            currentAddress2Balance = await testToken.balanceOf(address2.address)
            currentAddress3Balance = await testToken.balanceOf(address3.address)

            ERC20SendArray  = []
            ERC20SendArray.push({
                token: testToken.address,
                receiver: address1.address,
                amount: amountToAddress1
            })
            ERC20SendArray.push({
                token: testToken.address,
                receiver: address2.address,
                amount: amountToAddress2
            })
            ERC20SendArray.push({
                token: testToken.address,
                receiver: address3.address,
                amount: amountToAddress3
            })

        })

        it('ERC20 Tokens are transfered properly', async () => {

            await testToken.approve(multiSend.address, amountToBeSent)
            expect(await testToken.allowance(owner.address, multiSend.address)).to.equal(amountToBeSent)

            await expect(multiSend.connect(owner).ERC20MultiSend(ERC20SendArray))
            .not.to.be.reverted

            expect(await testToken.balanceOf(owner.address)).to.equal(currentOwnerBalance - amountToBeSent)
            expect(await testToken.balanceOf(address1.address)).to.equal(currentAddress1Balance + amountToAddress1)
            expect(await testToken.balanceOf(address2.address)).to.equal(currentAddress2Balance + amountToAddress2)
            expect(await testToken.balanceOf(address3.address)).to.equal(currentAddress3Balance + amountToAddress3)

        })

        it('ERC20 Tokens not transfered due to not approved enough', async () => {

            await expect(multiSend.connect(owner).ERC20MultiSend(ERC20SendArray))
            .to.be.revertedWith('ERC20: insufficient allowance')

        })

    })

})