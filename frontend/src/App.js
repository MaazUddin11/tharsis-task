import './App.css';
import { Button } from 'evergreen-ui';
import { ethers } from 'ethers'
import { useState } from 'react';

// Set provider to local net
const provider = new ethers.getDefaultProvider("http://localhost:8545");
const signer = provider.getSigner()
const tokenAddress = "0x90946C5C85038E1627289b21a4cbC6e761746E58";
const TokenABI = require('./artifacts/TokenABI.json');

function App() {
  const [myAccount, setMyAccount] = useState()
  const [recipientAccount, setRecipientAccount] = useState()
  const [amount, setAmount] = useState()

  // Request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  /*
  Function to call the deployed contract and query for the current balance.
  This function requires that you use the UI to set your account first.
  */
  async function getBalance() {
    if (!myAccount) {
      console.log("You must set your account first before requesting to get the balance.");
      return
    }
    if (typeof window.ethereum !== 'undefined') {
      // await requestAccount() -- Does not work
      const contract = new ethers.Contract(tokenAddress, TokenABI, provider);      
      const balance = await contract.balanceOf(myAccount);
      await balance.wait();
      balance.then((returned) => {
        console.log("Balance: ", returned.toString());
      });      
    }
  }

  /*
  Function to call the deployed contract and submit a tx to send `amount` of coins to the `recipientAccount`.
  This function requires that you use the UI to set the `amount` and `recipientAccount` first.
  */
  async function sendTokens() {
    if (!recipientAccount || !amount) {
      console.log("You must set the 'recipient account' and 'amount' before you can send tokens.");
      return
    }
    if (typeof window.ethereum !== 'undefined') {
      // await requestAccount() -- Does not work
      const contract = new ethers.Contract(tokenAddress, TokenABI, signer);
      const transaction = await contract.transfer(recipientAccount, amount);
      await transaction.wait();
      console.log(`${amount} Tokens successfully sent to ${recipientAccount}`);
    }
    console.log("Sent Tokens");
  }

  return (
    <div className="App">
      <header className="App-header">
        <Button appearance="primary" onClick={setMyAccount}>Set Account</Button>
        <input onChange={e => setMyAccount(e.target.value)} placeholder="Your Account ID" />
        <Button appearance="primary" onClick={getBalance}>Get Balance</Button>
        <Button appearance="primary" onClick={sendTokens}>Send Tokens</Button>
        <input onChange={e => setRecipientAccount(e.target.value)} placeholder="Recipient Address" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Amount" />
      </header>
    </div>
  );
}

export default App;
