window.onload = (event) => {
    isConnected();
 };
        
  async function isConnected() {
     const accounts = await ethereum.request({method: 'eth_accounts'});       
     if (accounts.length) {
        console.log(`You're connected to: ${accounts[0]}`);
     } else {
        console.log("Metamask is not connected");
     }
  }