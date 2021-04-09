const Web3 = require('web3')
const ContractKit = require('@celo/contractkit')
const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)
const CeloCrowdfund = require('../build/contracts/CeloCrowdfund.json');
const Project = require('../build/contracts/Project.json')
require('dotenv').config({path: '../.env'});

var projectData = []; 

async function initContract(){
  // Check the Celo network ID
  const networkId = await web3.eth.net.getId()

  // Get the contract associated with the current network
  const deployedNetwork = CeloCrowdfund.networks[networkId]

  // Create a new contract instance with the HelloWorld contract info
  let celoCrowdfundContract = new kit.web3.eth.Contract(
      CeloCrowdfund.abi,
      deployedNetwork && deployedNetwork.address
  )
  var projectInstanceContract = ''; 

  // Return results inside each individual project
  var result = await celoCrowdfundContract.methods.returnProjects().call();

  /* Note: For some reason using forEach is asynchronous, but for...of  
      maintains the synchronous results of using await. 
  */
  for (const projectAddress of result) {  
    projectInstanceContract = new web3.eth.Contract(
      Project.abi,
      deployedNetwork && projectAddress
    );

    await projectInstanceContract.methods.getDetails().call().then((result) => {
      projectData.push({result: result, projectInstanceContract: projectInstanceContract});
    });
  }

  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  kit.connection.addAccount(account.privateKey)

  console.log("ADDRESS: ", account.address);

  const stableToken = await kit.contracts.getStableToken();
 
  // const txObject = await celoCrowdfundContract.methods.startProject(stableToken.address, 'test title', 'test desc', 'https://i.imgur.com/15SD9vT.jpeg', 5, 10).send({from: account.address, feeCurrency: stableToken.address});
  // console.log("Made new project"); 

  const approveTx = await stableToken.approve(projectInstanceContract._address, 10000000).send({from: account.address, feeCurrency: stableToken.address});
  console.log("Approved spending for new project");

  var donate = await projectInstanceContract.methods.contribute(11).send({from: account.address, feeCurrency: stableToken.address});
  console.log("Donated to new project")

  var payOut = await projectInstanceContract.methods.payOut().send({from: account.address, feeCurrency: stableToken.address});
  console.log("Paying out from project")

  var projectDetails = await projectInstanceContract.methods.getDetails().call();
  console.log("PROJECT DETAILS: ", projectDetails);
  
  var balanceOfContract = (await stableToken.balanceOf(projectInstanceContract._address)).toString();
  console.log("Contract address: ", projectInstanceContract._address);
  console.log("Contract cUSD balance: ", balanceOfContract);

  var balanceOfUser = (await stableToken.balanceOf(account.address)).toString();
  console.log("User's address: ", account.address);
  console.log("User's cUSD balance: ", balanceOfUser);
}

initContract();