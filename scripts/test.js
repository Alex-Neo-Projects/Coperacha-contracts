const Web3 = require('web3')
const ContractKit = require('@celo/contractkit')
const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)

require('dotenv').config({path: '../.env'});

// Get Celo account info 
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
kit.connection.addAccount(account.privateKey)

async function myFunction() {
  const stableToken = await kit.contracts.getStableToken();
  const exchange = await kit.contracts.getExchange()
  
  const cUsdBalance = await stableToken.balanceOf(account.address)
  
  const approveTx = await stableToken.approve(exchange.address, cUsdBalance).send({from: account.address})
  const approveReceipt = await approveTx.waitReceipt()
  
  const goldAmount = await exchange.quoteUsdSell(cUsdBalance)
  const sellTx = await exchange.sellDollar(cUsdBalance, goldAmount).send({from: account.address})
  const sellReceipt = await sellTx.waitReceipt()
} 

myFunction(); 
