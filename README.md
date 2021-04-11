# Coperacha Contracts
This repo contains the Solidity smart contracts for [Coperacha](https://www.coperacha.app).

These contracts serve as the backend for the Coperacha App. The source code for the app can be found [here](https://github.com/Alex-Neo-Projects/Coperacha-app), as well as a longer readme, download links, and screenshots of the app in use. 

The biggest takeaway we got from creating these contracts is this: 

![infrastructure](https://i.imgur.com/3PqEjaF.png)
Using Celo meant we could accept payments without all the infrastructure overhead of doing it with the traditional financial system. Replicating the functionality of the smart contract using the traditional financial system would likely take Plaid (banking), Stripe (payments), AWS (server hosting), and MongoDB (storing user data). The smart contract we wrote in 160 lines of code and a few hours covered all of that with a comparably tiny amount of hassle.

# Smart contract breakdown

We made a three part tutorial series on creating, deploying, and interacting with the Coperacha contracts. If you get stuck reading the code, feel free to check out the tutorials: 

[1. Building a Crowdfunding Smart Contract in Celo](https://github.com/alexreyes/Celo-Crowdfunding-Tutorial)
[2. Deploying a Crowdfunding Smart Contract in Celo](https://github.com/alexreyes/Celo-Crowdfunding-Tutorial-2)
[3. Interacting with the Crowdfunding Smart Contracts in Celo](https://github.com/alexreyes/Celo-Crowdfunding-Tutorial-3)

