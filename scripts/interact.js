const Web3 = require('web3')
const ContractKit = require('@celo/contractkit')
const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)
const CeloCrowdfund = require('../build/contracts/CeloCrowdfund.json');
const Project = require('../build/contracts/Project.json')
const BigNumber = require('bignumber.js');

require('dotenv').config({path: '../.env'});

var projectData = []; 

async function initContract(){
  // Check the Celo network ID
  const networkId = await web3.eth.net.getId()

  // Get the contract associated with the current network
  const deployedNetwork = CeloCrowdfund.networks[networkId]

  // Create a new contract instance from the celo crowdfund contract
  let celoCrowdfundContract = new kit.web3.eth.Contract(
      CeloCrowdfund.abi,
      deployedNetwork && deployedNetwork.address
  )

  var projectInstanceContract = ''; 

  // Return projects inside the celo crowdfund contract
  var result = await celoCrowdfundContract.methods.returnProjects().call();

  // Loop through the existing projects
  for (const projectAddress of result) {  
    // Create a new project instance for each project
    projectInstanceContract = new web3.eth.Contract(
      Project.abi,
      deployedNetwork && projectAddress
    );
    
    // Get the details for each project, and save it to projectData[]
    await projectInstanceContract.methods.getDetails().call().then((result) => {
      projectData.push({result: result, projectInstanceContract: projectInstanceContract});
    });
  }

  // Get Celo account info 
  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  kit.connection.addAccount(account.privateKey)

  // Print wallet address so we can check it on the block explorer
  console.log("Account address: ", account.address);

  // Get the cUSD ContractKit wrapper 
  const stableToken = await kit.contracts.getStableToken();

  var projectGoal = BigNumber(1E18);

  // Create a new project
  await celoCrowdfundContract.methods.startProject(stableToken.address, 'Test project title', 'test project description', 'https://i.imgur.com/T9RAp1T.jpg', 5, projectGoal).send({from: account.address, feeCurrency: stableToken.address}).then(async () => {
    console.log("Created a new project"); 
  }).then(async () => {
    var projectDetails = await projectInstanceContract.methods.getDetails().call();
    console.log("Project details: ", projectDetails);
  }).then(async () => {
    // Celo uses 18 decimal places. Set approval to be for 5 cUSD 
    var approvedAmount = BigNumber(5E18); 
  
    // // Need to approve the use of using cUSD with the smart contract. 
    await stableToken.approve(projectInstanceContract._address, approvedAmount).send({from: account.address, feeCurrency: stableToken.address});
    console.log("Approved spending for new project\n");
  }).then(async () => {
    // Send 2 cUSD to the contract
    // var sendAmount = BigNumber(2E18); 
    var sendAmount = BigNumber(1E17); 
    
    // Call contribute() function with 2 cUSD
    await projectInstanceContract.methods.contribute(sendAmount).send({from: account.address, feeCurrency: stableToken.address});
    console.log("Donated to the new project\n");
  }).then(async () => {
      var balanceOfContract = (await stableToken.balanceOf(projectInstanceContract._address)).toString();
      console.log("Contract address: ", projectInstanceContract._address);
      console.log("Contract cUSD balance: ", balanceOfContract/1E18, " cUSD\n");
      
      var balanceOfUser = (await stableToken.balanceOf(account.address)).toString();
      console.log("User's address: ", account.address);
      console.log("User's cUSD balance: ", balanceOfUser/1E18, " cUSD");
  })



  // var payOut = await projectInstanceContract.methods.payOut().send({from: account.address, feeCurrency: stableToken.address});
  // console.log("Paying out from project")

}

initContract();