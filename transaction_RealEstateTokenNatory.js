const ABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";
import { bytecode } from "./bytecode.js";

//addr of current connected contract's instance
var ADDRESS = "";
//connected contract with only bytecode and ABI, allowing deploy(), not for calling functions
var CONTRACT;
//connected instance of deployed contract, used to call functions
var INSTANCE;
//current metamask wallet address
var ACCOUNT;
//provider, window.ethereum for metamask
var web3 = new Web3(window.ethereum);
const storedAddresses = JSON.parse(localStorage.getItem("deployedAddresses")) || [];

window.addEventListener("load", async () => {
	await connectContract();
	await connectWallet();
	await updateNatoryList(storedAddresses);
	const Btn_connectWallet = document.querySelector("#connectWallet");
	const Btn_deploy = document.querySelector("#deploy");
	const Btn_connectInstance = document.querySelector("#connectInstance");
    const Btn_createProperty = document.querySelector("#createProperty")

	Btn_connectInstance.addEventListener("click", async () => {
		await connectInstance();
	});

	Btn_connectWallet.addEventListener("click", async () => {
		await connectWallet();
	});

	Btn_deploy.addEventListener("click", async () => {
		await deploy();
	});

    Btn_createProperty.addEventListener("click", async () => {
        await createProperty();
    });

	document.querySelector("#natoryList").addEventListener("click", async (event) => {
		const target = event.target;
		if (target.tagName === "LI") {
			const selected = document.querySelector("li.selectednNatory");
			if (selected) {
				selected.classList.remove("selectednNatory");
			}
			target.classList.add("selectednNatory");
			ADDRESS = target.textContent;
			console.log("Picked: ", ADDRESS);
		}
	});

	document.querySelector("#propertyList").addEventListener("click", async (event) => {
		const target = event.target;
		if (target.tagName === "LI") {
			const selected = document.querySelector("li.selectedProperty");
			if (selected) {
				selected.classList.remove("selectedProperty");
			}
			target.classList.add("selectedProperty");
			ADDRESS = target.textContent;
			console.log("Picked: ", ADDRESS);
		}
	});
});

export const getJson = async (path) => {
	const response = await fetch(path);
	const data = await response.json();
	return data;
};

const connectWallet = async () => {
	const accounts = await ethereum.request({ method: "eth_requestAccounts" });
	ACCOUNT = accounts[0];
	console.log("Connected to metamask wallet:", ACCOUNT);
};

const connectContract = async () => {
	try {
		const data = await getJson(ABI);
		CONTRACT = new web3.eth.Contract(data.abi);
		console.log("Connected to RET_Natory");
	} catch (error) {
		console.log("connectContract() error: ", error);
	}
};

const connectInstance = async () => {
	const selectedElement = document.querySelector("li.selectednNatory");
	if (!selectedElement) {
		console.log("No selected element");
		return;
	}
	try {
		const data = await getJson(ABI);
		INSTANCE = new web3.eth.Contract(data.abi, ADDRESS);
		const res = await getCreatedProperty();
		await updatePropertyList(res);
		console.log("connectInstance() done\nConnected to", ADDRESS);
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
		const addr = instance.options.address;
		console.log("New instance deployed:", addr);
		await storedAddresses.push(addr);
		await localStorage.setItem("deployedAddresses", JSON.stringify(storedAddresses));
		await updateNatoryList(storedAddresses);
	} catch (error) {
		console.log(error);
	}
};

const createProperty = async () => {
	try {
		const location = document.getElementById("createLocation").value;
		const value = document.getElementById("createValue").value;

		await INSTANCE.methods
			.createProperty(location, value)
			.send({
				from: ACCOUNT,
			})
			.on("receipt", (receipt) => {
				console.log("Property created:", receipt);
			});
        await document.getElementById("inputLocation").reset();
        await document.getElementById("inputValue").reset();
	} catch (error) {
		console.log("createProperty() error:", error);
	}
};

const getCreatedProperty = async () => {
	if (INSTANCE == null) {
		console.log("No instance is connected");
		return;
	}
	try {
		const properties = await INSTANCE.methods.getDeployedProperties().call();
		console.log("Deployed properties from", ADDRESS, ":", properties);
		return properties;
	} catch (error) {
		console.log("This natory does not have any created property");
	}
};

const updatePropertyList = async (properties) => {
	if (properties.length == 0) {
		const propertyList = document.querySelector("#propertyList");
		propertyList.innerHTML = "No created property.";
		return;
	}
	const propertyList = document.querySelector("#propertyList");
	propertyList.innerHTML = "";
	for (let i = 0; i < properties.length; i++) {
		if (i == properties.length - 1) {
			propertyList.innerHTML += "<li class='list-group-item'>" + properties[i] + "</li>";
			break;
		}
		propertyList.innerHTML += "<li class='list-group-item'>" + properties[i] + "</li><hr class='mt-3.5 mb-3.5'>";
	}
};

const updateNatoryList = async (addresses) => {
	if (addresses.length === 0) {
		console.log("No deployed instances.");
		return;
	}
	const natoryList = document.querySelector("#natoryList");
	natoryList.innerHTML = "";
	for (let i = 0; i < addresses.length; i++) {
		if (i == addresses.length - 1) {
			natoryList.innerHTML += "<li class='list-group-item'>" + addresses[i] + "</li>";
			break;
		}
		natoryList.innerHTML += "<li class='list-group-item'>" + addresses[i] + "</li><hr class='mt-3.5 mb-3.5'>";
	}
};

//getter functions
export const getAddress = () => ADDRESS;
export const getContract = () => CONTRACT;
export const getInstance = () => INSTANCE.options.address;
export const getAccount = () => ACCOUNT;
export const getWeb3 = () => web3;
export const getStoredAddresses = () => storedAddresses;
