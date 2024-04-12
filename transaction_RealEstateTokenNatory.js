const ContractAddress = "0x67e296375238a2627914b42ab790258e16392c43";
const ContractABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";

import { bytecode } from "./bytecode.js";
let infoSpace;
let web3;
let Contract;
let account;

window.addEventListener("load", () => {
	infoSpace = document.querySelector(".txn-data");

	document.querySelector(".load").addEventListener("click", async () => {
		if (ContractAddress === "" || ContractABI === "") {
			printResult(
				`Make sure to set the variables <code>contractAddress</code> and <code>contractAbi</code> in <code>./index.js</code> first. Check out <code>README.md</code> for more info.`
			);
			return;
		}

		if (typeof ethereum === "undefined") {
			printResult(
				`Metamask not connected. Make sure you have the Metamask plugin, you are logged in to your MetaMask account, and you are using a server or a localhost (simply opening the html in a browser won't work).`
			);
			printResult(typeof ethereum);
			return;
		}

		web3 = new Web3(window.ethereum);

		await connectWallet();
		await connectContract_one(ContractABI);
		await deploy();
	});
});

const getJson = async (path) => {
	const response = await fetch(path);
	const data = await response.json();
	return data;
};

const connectWallet = async () => {
	const accounts = await ethereum.request({ method: "eth_requestAccounts" });
	account = accounts[0];
};

const connectContract_one = async (abi) => {
	const data = await getJson(abi);
	const abiJson = data.abi;
	Contract = new web3.eth.Contract(abiJson);
};

const connectContract_two = async (abi, addr) => {
	const data = await getJson(abi);
	const abiJson = data.abi;
	Contract = new web3.eth.Contract(abiJson, addr);
};

const getBalance = async (addr) => {
	let balance = await web3.eth.getBalance(addr);
	return balance;
};

const createProperty = async () => {
	try {
		let location = document.getElementById("input-location").value;
		let value = document.getElementById("input-value").value;
		await connectContract_two(contractABI, contractAddress);
		Contract.methods
			.createProperty(location, value)
			.send({ from: account });
	} catch (error) {
		console.log(error.message);
	}
};

const getDeployedProperties = async () => {
	printResult("getDeployedProperties() called.");
	//type of registeredProperties = object, i.e. registeredProperties[0]
	registeredProperties = await NatoryContract.methods
		.getDeployedProperties()
		.call();
	printResult("Registered properties: " + registeredProperties);
};

const deploy = async () => {
	await connectContract_one(ContractABI);

	const constructorArgs = ["Location A", 1000000];
    Contract.options.data = "0x" + bytecode;
    Contract.options.arguments = constructorArgs;

    Contract.deploy({
        arguments: [123, 'My String']
    })
    .send({
        from: account,
    })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
    });
};