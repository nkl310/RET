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

window.addEventListener("load", () => {
	updateContractSelectOptions(storedAddresses);
	const natoryList = document.querySelector("#natoryList");
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
        if(ppts){
            await update(ppts);
        }
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
            console.log("Chosen addr: ", ADDRESS);
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
    const selectedElement = document.querySelector("li.selectednNatory");
    if (!selectedElement) {
      console.log("No selected element");
      return;
    }
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
		const addr = instance.options.address;
		console.log("New instance deployed:", addr);
		await storedAddresses.push(addr);
		await localStorage.setItem("deployedAddresses", JSON.stringify(storedAddresses));
		await updateContractSelectOptions(storedAddresses);
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
    if(INSTANCE == null){
        console.log("No instance is connected");
        return;
    }
	try{
		const properties = await INSTANCE.methods.getDeployedProperties().call();
        console.log("Deployed properties from", ADDRESS, ":", properties);
        return properties;
	} catch (error) {
        console.log("This natory does not have any created property")
	}
};

const update = async (properties) => {
	const list = document.querySelector("#propertyList");
	list.innerHTML = ""; // Clear the list before updating
	for (let i = 0; i < properties.length; i++) {
		list.innerHTML += "<li>" + properties[i] + "</li>";
	}
};

const updateContractSelectOptions = async (addresses) => {
	if (addresses.length === 0) {
		console.log("No deployed instances.");
		return;
	}
	const natoryList = document.querySelector("#natoryList");
	natoryList.innerHTML = "";
	for (let i = 0; i < addresses.length; i++) {
		natoryList.innerHTML += "<li>" + addresses[i] + "</li>";
	}
};

//getter functions
export const getAddress = () => ADDRESS;
export const getContract = () => CONTRACT;
export const getInstance = () => INSTANCE.options.address;
export const getAccount = () => ACCOUNT;
export const getWeb3 = () => web3;
export const getStoredAddresses = () => storedAddresses;