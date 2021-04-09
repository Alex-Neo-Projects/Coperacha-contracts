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

  console.log("ADDRESS: ", account.address);

  // Get the cUSD ContractKit wrapper 
  const stableToken = await kit.contracts.getStableToken();

  var projectGoal = BigNumber(1E18);

  // Shorthand function to pause script execution 
  const wait = ms => new Promise(res => setTimeout(res, ms));

  // Create a new project
  await celoCrowdfundContract.methods.startProject(
    stableToken.address, 'Test project title', 'test project description', 'https://i.imgur.com/T9RAp1T.jpg', 5, projectGoal)
    .send({from: account.address, feeCurrency: stableToken.address})
    .then(async () => {
      console.log("Created a new project"); 

      var projectDetails = await projectInstanceContract.methods.getDetails().call();
      console.log("PROJECT DETAILS: ", projectDetails);
      console.log("Contract address: ", projectInstanceContract._address);

      // Celo uses 18 decimal places. Set approval to be for 5 cUSD 
      var approvedAmount = BigNumber(5E18); 
      
      // Need to approve the use of using cUSD with the smart contract. 
      await stableToken.approve(projectInstanceContract._address, approvedAmount).send({from: account.address, feeCurrency: stableToken.address});
      
      console.log("Approved spending for new project");

      /* We need to wait for the approval to be mined and reflected by the Celo network. 
         To keep things simple we can just wait 7 seconds [not recommended for non-tutorial scripts] */
      await wait(7000); 
      console.log("Done waiting 7 seconds");
    }).then(async () => {
      // Send 2 cUSD to the contract
      var sendAmount = BigNumber(2E18); 

      // call contribute() function with 2 cUSD
      await projectInstanceContract.methods.contribute(sendAmount).send({from: account.address, feeCurrency: stableToken.address});
      console.log("Donated to new project");
    }).then(async () => {
      var balanceOfContract = (await stableToken.balanceOf(projectInstanceContract._address)).toString();
      console.log("Contract address: ", projectInstanceContract._address);
      console.log("Contract cUSD balance: ", balanceOfContract);
    
      var balanceOfUser = (await stableToken.balanceOf(account.address)).toString();
      console.log("User's address: ", account.address);
      console.log("User's cUSD balance: ", balanceOfUser);
    });
 


  // var payOut = await projectInstanceContract.methods.payOut().send({from: account.address, feeCurrency: stableToken.address});
  // console.log("Paying out from project")

}

initContract();