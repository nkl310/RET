const ABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";
import { bytecode } from "./bytecode.js";

var ADDRESS = "";
var CONTRACT;
var INSTANCE;
var ACCOUNT;
var web3 = new Web3(window.ethereum);

window.addEventListener("load", () => {
	const selectContract = document.querySelector("#selectContract");
	const Btn_connectWallet = document.querySelector("#connectWallet");
	const Btn_connectContract = document.querySelector("#connectContract");
	const Btn_deploy = document.querySelector("#deploy");
	const Btn_connectInstance = document.querySelector("#connectInstance");
	const Btn_createProperty = document.querySelector("#createProperty");
	const Btn_getDeployedProperties = document.querySelector("#getDeployedProperties");

	Btn_connectWallet.addEventListener("click", async () => {
		await connectWallet();
	});

	Btn_connectContract.addEventListener("click", async () => {
		await connectContract();
	});

	Btn_deploy.addEventListener("click", async () => {
		await deploy();
	});

	Btn_connectInstance.addEventListener("click", async () => {
		await connectInstance();
	});

	Btn_createProperty.addEventListener("click", async () => {
		await createProperty();
	});
	Btn_getDeployedProperties.addEventListener("click", async () => {
		const ppts = await getDeployedProperties();
		await update(ppts);
	});

	selectContract.addEventListener("change", () => {
		const selectedAddress = selectContract.value;
		if (selectedAddress !== "") {
			ADDRESS = selectedAddress;
			console.log("Selected contract address:", ADDRESS);
		}
	});
});

const getJson = async (path) => {
	const response = await fetch(path);
	const data = await response.json();
	return data;
};

const connectWallet = async () => {
	const accounts = await ethereum.request({ method: "eth_requestAccounts" });
	ACCOUNT = accounts[0];
	console.log(ACCOUNT);
};

const connectContract = async () => {
	try {
		const data = await getJson(ABI);
		CONTRACT = new web3.eth.Contract(data.abi);
		console.log("connectContract() done");
	} catch (error) {
		console.log("connectContract() error: ", error);
	}
};

const connectInstance = async () => {
	try {
		const data = await getJson(ABI);
		INSTANCE = new web3.eth.Contract(data.abi, ADDRESS);
		console.log("connectInstance() done");
	} catch (error) {
		console.log("connectInstance() error: ", error);
	}
};

const deploy = async () => {
	try {
		const instance = await CONTRACT.deploy({
			arguments: ["", 0],
			data: "0x" + bytecode,
		}).send({
			from: ACCOUNT,
		});
		ADDRESS = instance.options.address;
		console.log("New instance deployed:", ADDRESS);
		// Store the deployed contract address in local storage
		const storedAddresses = JSON.parse(localStorage.getItem("deployedAddresses")) || [];
		storedAddresses.push(ADDRESS);
		localStorage.setItem("deployedAddresses", JSON.stringify(storedAddresses));
		updateContractSelectOptions(storedAddresses);
	} catch (error) {
		console.log(error);
	}
};

const createProperty = async () => {
	try {
		const location = document.getElementById("location").value;
		const value = document.getElementById("value").value;

		await INSTANCE.methods
			.createProperty(location, value)
			.send({
				from: ACCOUNT,
			})
			.on("receipt", (receipt) => {
				console.log("Property created:", receipt);
			});
	} catch (error) {
		console.log("createProperty() error:", error);
	}
};

const getDeployedProperties = async () => {
	try {
		const properties = await INSTANCE.methods.getDeployedProperties().call();
		console.log("Deployed properties:", properties);
		return properties;
	} catch (error) {
		console.log("getDeployedProperties() error:", error);
		return;
	}
};

const update = async (properties) => {
	const list = document.querySelector("#Instances");
	list.innerHTML = ""; // Clear the list before updating
	for (let i = 0; i < properties.length; i++) {
		list.innerHTML += "<li>" + properties[i] + "</li>";
	}
};

const updateContractSelectOptions = async (addresses) => {
	const selectContract = document.querySelector("#selectContract");
	selectContract.innerHTML = ""; // Clear the select options before updating
	selectContract.innerHTML += '<option value="">Select Contract</option>'; // Add a default option
	addresses.forEach((address) => {
		selectContract.innerHTML += `<option value="${address}">${address}</option>`;
	});
};

// Load stored contract addresses from local storage
const storedAddresses = JSON.parse(localStorage.getItem("deployedAddresses")) || []; // If no addresses are stored, initialize with an empty array
updateContractSelectOptions(storedAddresses);
