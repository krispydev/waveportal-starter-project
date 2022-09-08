import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortal from './utils/WavePortal.json';
import { getContractAddress } from "ethers/lib/utils";

export default function App() {

  // state variable to store the user's wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0x8C4AE0A1465E07286316f3596460Ba870e6D25fE";
  const contractABI = wavePortal.abi;

  // checking if we have access to windows.ethereum; 
  // ethereum is a special object which MetaMask inserts into our window object
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        console.log("Please install MetaMask");
      } else {
        console.log("ethereum object is present: ", ethereum);
      }

      // check if we're authorized to access the user's wallet
      // ("When we first visit a website, we have to authorize it to access our account in the wallet.")
      const accounts = await ethereum.request({ method: "eth_accounts"});

      if(accounts.length!==0) {
        const account = accounts[0];
        console.log("There is an authorized account: ", account);
        setCurrentAccount(account);
      } else {
        console.log("Please authorize MetaMask access to this website.");
      }
    } catch(error) {
      console.log(error);
    }
  }

  // code for connectWallet()
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        window.alert("Get MetaMask");
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_requestAccounts"})
        const account = accounts[0];
        console.log("Account Connected is: ", account);
        setCurrentAccount(account);
      }
    } catch (error) {
      console.log(error);
    }
  }



  // using useEffect like this runs the function only once at the time of rendering
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async () => {
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); // use nodes MetaMask provides in the background to send or receive data
        const signer = provider.getSigner(); // an abstraction of an ethereum account. it's used to sign messages and trasactions
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);  // creates an instance of the contract

        let count = await wavePortalContract.getTotalWaves();
        console.log("Total Waves: ", count.toNumber());

          const waveTxn = await wavePortalContract.wave(message);
          await waveTxn.wait();
          console.log(waveTxn);
          count = await wavePortalContract.getTotalWaves();
          console.log(count); // it's a bigNumber object
          console.log("Total Waves Now: ", count.toNumber());
      } else {
        console.log("Please install MetaMask");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const waveList = async() => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            message: wave.message,
            timestamp: new Date(wave.timestamp * 1000),
          });
        });

        console.log(wavesCleaned);
        console.log("waveList() got called");
        setAllWaves(wavesCleaned);
      } else {
        console.log("MetaMask is not installed. Please install MetaMask.");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Chris and I worked on dapps so that's pretty cool right? 
        <br/><br/>
        Connect your Ethereum wallet and send me a message that'll stay forever in the blockchain!
        </div>

        <div className="bio">
          <form>
            <label> 
              <input
                type='text' value={message} onChange={(e) => setMessage(e.target.value)} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px", border: "0", borderRadius: "5px"}}/>
            </label>
          </form>
        </div>
        

        {
          message && (
            <button className="waveButton" onClick={wave}>
              Wave at Me
            </button>
          )
        }

        <button className="waveButton" onClick={waveList}>
          Click to view Wave List in console
        </button>

        {/*
        Connect Wallet Button
        */}
        {
          !currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )
        }

        {
          allWaves.map((wave, index) => {
            return(
              <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}
// added this line again