const contractAddress = "0xf8a8490F24E8161b3E48808FDAfb854123b239d4";
const contractABI = "./sol_ABI/transaction_RealEstateToken.json";

const NatoryContractAddress = "0x3825Bc871f792bde27c956BB1836db0cC5c7D69F";
const NatoryContractABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";

let registeredProperties = "";

let infoSpace;
let web3;
let NatoryContract;
let Contract;
let account;

window.addEventListener("load", () => {
    infoSpace = document.querySelector(".txn-data");

    document.querySelector(".load").addEventListener("click", async () => {
        if (NatoryContractAddress === "" || NatoryContractABI === "") {
            printResult(
                `Make sure to set the variables <code>contractAddress</code> and <code>contractAbi</code> in <code>./index.js</code> first. Check out <code>README.md</code> for more info.`
            );
            return;
        }

        if (typeof ethereum === "undefined") {
            printResult(
                `Metamask not connected. Make sure you have the Metamask plugin, you are logged in to your MetaMask account, and you are using a server or a localhost (simply opening the html in a browser won't work).`
            );
            printResult(typeof ethereum)
            return;
        }

        web3 = new Web3(window.ethereum);

        await connectWallet();
        await connectNatoryContract(NatoryContractABI, NatoryContractAddress);
        await connectContract(contractABI, contractAddress);
        await createProperty();
        await fillCardWithData();
    });
});

const printResult = (text) => {
    infoSpace.innerHTML += `<li>${text}</li>`;
};

const getJson = async (path) => {
    const response = await fetch(path);
    const data = await response.json();
    return data;
};

const connectWallet = async () => {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
};

const connectNatoryContract = async (contractAbi, contractAddress) => {
    const data = await getJson(contractAbi);
    const contractABI = data.abi;
    NatoryContract = new web3.eth.Contract(contractABI, contractAddress);
};

const connectContract = async (contractAbi, contractAddress) => {
    const data = await getJson(contractAbi);
    const contractABI = data.abi;
    contract = new web3.eth.Contract(contractABI, contractAddress);
};

const getBalance = async (address) => {
    printResult(`getBalance() requested.`);
    const balance = await web3.eth.getBalance(address);
    printResult(`Account ${account} has ${web3.utils.fromWei(balance, "ether")} currency`);
};

const createProperty = async () => {
    try {
        let inputLocation = document.getElementById("input-location").value;
        let inputValue = document.getElementById("input-value").value;
        await connectContract(NatoryContractABI, NatoryContractAddress);
        await NatoryContract.methods.createProperty(inputLocation, inputValue).send({from: account});
        document.getElementById("input-location").value = null
        document.getElementById("input-value").value = null
        await fillCardWithData();
    } catch (error) {
        console.log("Error: " + error.message);
    }
};

const getDeployedProperties = async () => {
    printResult("getDeployedProperties() called.")
    //type of registeredProperties = object, i.e. registeredProperties[0]
    registeredProperties = await NatoryContract.methods.getDeployedProperties().call()
    printResult("Registered properties: " + registeredProperties);
};

const getVar = async () => {
    printResult("getVar() called")
    const owner = await contract.methods.owner().call();
    const property = await contract.methods.property().call();
    const location = property[0]
    const value = property[1];
    const isTokenized = property[2];
    const newPropertiesAddress = property[3]
    printResult("owner: " + owner);
    printResult("location: " + location);
    printResult("value: " + value);
    printResult("isTokenized: " + isTokenized)
    printResult("newPropertiesAddress: " + newPropertiesAddress)
};

const getTotalSupply = async () => {
    printResult("getTotalSupply() called")
    try {
        const totalSupply = await contract.methods.totalSupply().call();
        printResult("total supply: " + totalSupply);
        printResult("getTotalSupply() done")
    } catch (error) {
        printResult(`Error: ${error.message}`);
    }
}

const fillCardWithData = async () => {
    var cardContent = document.querySelector('.card-body.txn-data');
    var html = "";
    registeredProperties = await NatoryContract.methods.getDeployedProperties().call()

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