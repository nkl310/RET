const ContractAddress = "0x67e296375238a2627914b42ab790258e16392c43";
const ContractABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";

let web3;
let Contract;
let account;

const getJson = async (path) => {
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

const connectWallet = async () => {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
};

const connectContract = async (abi, addr) => {
    const data = await getJson(abi);
    const abiJson = data.abi;
    Contract = new web3.eth.Contract(abiJson, addr);
}

const getBalance = async (addr) => {
    let balance = await web3.eth.getBalance(addr);
    return balance;
}

const createProperty = async () => {
    try{
        let location = document.getElementById("input-location").value;
        let value = document.getElementById("input-value").value;
        await connectContract(contractABI, contractAddress);
        Contract.methods.createProperty(location, value).send({from: account});
    }catch(error){
        console.log(error.message)
    }
}

const getDeployedProperties = async () => {
    printResult("getDeployedProperties() called.")
    //type of registeredProperties = object, i.e. registeredProperties[0]
    registeredProperties = await NatoryContract.methods.getDeployedProperties().call()
    printResult("Registered properties: " + registeredProperties);
};

const getTotalSupply = async () => {
    printResult("getTotalSupply() called")
    try {
        const totalSupply = await contract.methods.totalSupply().call();
        return totalSupply;
    } catch (error) {
        console.log(error.message);
    }
}

const fillCard = async () => {
    var cardContent = document.querySelector('.card-body.txn-data');
    var html = "";
    //TO-DO: export from js, registered properties object
    let registeredProperties = require("./")

    var startIndex = Math.max(registeredProperties.length - 5, 0); // Calculate the starting index based on the data length

    for (var i = startIndex; i < registeredProperties.length; i++) {
        await connectContract(contractABI, registeredProperties[i])
        property = await contract.methods.property().call();
        owner = await contract.methods.owner().call();

		html += '<div class="card-line">';
		html += "Owner: " + owner + "<br>";
		html += "Location: " + property[0] + "<br>";
		html += "Value: " + property[1] + "<br>";
		html += "</div>";

        if (i !== registeredProperties.length - 1) {
            html += '<hr class="card-line-divider">';
        }
    }   

    cardContent.innerHTML = html;
}