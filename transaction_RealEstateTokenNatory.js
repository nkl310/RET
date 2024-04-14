const ABI = "./sol_ABI/transaction_RealEstateTokenNatory.json";
import { bytecode } from "./bytecode.js";

var ADDRESS = "0x7911cFF8C74E4cba2B2B68cD90C494a8eE836c08";
var CONTRACT;
var INSTANCE;
var ACCOUNT;
var web3 = new Web3(window.ethereum);

window.addEventListener("load", () => {
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
		await getDeployedProperties();
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
			from: ACCOUNT
		});
		ADDRESS = instance.options.address;
		console.log("New instance deployed:", ADDRESS);
	} catch (error) {
		console.log(error);
	}
};

const createProperty = async () => {
	try {
		const location = "Testing415";
		const value = 224;

		await INSTANCE.methods.createProperty(location, value).send({
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
		const properties = await INSTANCE.methods
			.getDeployedProperties()
			.call();
		console.log("Deployed properties:", properties);
		return properties;
	} catch (error) {
		console.log("getDeployedProperties() error:", error);
		return;
	}
};
