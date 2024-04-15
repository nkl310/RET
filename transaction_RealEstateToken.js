import { getAddress, getInstance, getAccount, getWeb3, getStoredAddresses, getJson } from "./transaction_RealEstateTokenNatory.js";
const ABI = "./sol_ABI/transaction_RealEstateToken.json";
var web3 = getWeb3();

var PROPERTY;
var ADDRESS;
let selectedProperty;

window.addEventListener("load", () => {
	const Btn_getPropertyData = document.querySelector("#getPropertyData");
	const Btn_getTotalSupply = document.querySelector("#getTotalSupply");
	const Btn_getBalanceOf = document.querySelector("#getBalanceOf");
	const Btn_getAllowance = document.querySelector("#getAllowance");
	const Btn_connectProperty = document.querySelector("#connectProperty");
	const Btn_tokenizeProperty = document.querySelector("#tokenizeProperty");
	const Btn_setProperty = document.querySelector("#setProperty");

	Btn_getPropertyData.addEventListener("click", async () => {
		await getPropertyData();
	});

	Btn_getTotalSupply.addEventListener("click", async () => {
		await getTotalSupply();
	});

	Btn_getBalanceOf.addEventListener("click", async () => {
		await getBalanceOf(getAccount());
	});

	Btn_getAllowance.addEventListener("click", async () => {
		//await getAllowance();
	});

	Btn_connectProperty.addEventListener("click", async () => {
		await connectProperty();
	});

	Btn_tokenizeProperty.addEventListener("click", async () => {
		const amount = document.querySelector("#tokenizeProperty_amount").value;
		await tokenizeProperty(amount);
	});

	Btn_setProperty.addEventListener("click", async () => {
		const location = document.querySelector("#setProperty_location").value;
		const value = document.querySelector("#setProperty_value").value;
		await setProperty(location, value);
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
			console.log("Chosen Property: ", ADDRESS);
		}
	});
});

const connectProperty = async () => {
	const selectedElement = document.querySelector("li.selectedProperty");
	if (!selectedElement) {
		console.log("No selected property");
		return;
	}
	try {
		const data = await getJson(ABI);
		PROPERTY = new web3.eth.Contract(data.abi, ADDRESS);
		console.log("connectProperty() done");
	} catch (error) {
		console.log("connectProperty() error: ", error);
	}
};

const getPropertyData = async () => {
	try {
		const owner = await PROPERTY.methods.owner().call();
		const propertyData = await PROPERTY.methods.property().call();
		const location = propertyData.location;
		const value = propertyData.value;
		const isTokenized = propertyData.isTokenized;
		console.log("Owner: ", owner);
		console.log("Location: ", location);
		console.log("Value: ", value);
		console.log("isTokenized: ", isTokenized);
	} catch (error) {
		console.log(error);
	}
};

const getTotalSupply = async () => {
	try {
		const totalSupply = await PROPERTY.methods.totalSupply().call();
		console.log(totalSupply);
	} catch (error) {
		console.log(error.message);
	}
};

const getBalanceOf = async (addr) => {
	try {
		const balance = await PROPERTY.methods.balanceOf(addr).call();
		console.log(balance);
	} catch (error) {
		console.log(error.message);
	}
};

const getAllowance = async (owner, spender) => {
	try {
		const allowance = await PROPERTY.methods.allowance(owner, spender).call();
		console.log(allowance);
	} catch (error) {
		console.log(error.message);
	}
};

const transfer = async (to, amount) => {
	try {
		const success = await PROPERTY.methods.transfer(to, amount).send({ from: getAccount() });
		if (success) {
			console.log("transfer() done");
		} else {
			console.log("transfer() failed");
		}
	} catch (error) {
		console.log(error);
	}
};

const approve = async (spender, amount) => {
	try {
		const success = await PROPERTY.methods.approve(to, amount).send({ from: getAccount() });
		if (success) {
			console.log("approve() done");
		} else {
			console.log("approve() failed");
		}
	} catch (error) {
		console.log(error);
	}
};

const trasnferFrom = async (from, to, amount) => {
	try {
		const success = await PROPERTY.methods.trasnferFrom(from, to, amount).send({ from: getAccount() });
		if (success) {
			console.log("trasnferFrom() done");
		} else {
			console.log("trasnferFrom() failed");
		}
	} catch (error) {
		console.log(error);
	}
};

const tokenizeProperty = async (tokenAmount) => {
	await PROPERTY.methods.tokenizeProperty(tokenAmount).send({
		from: getAccount(),
	}),
		(error, transactionHash) => {
			if (error) {
				console.error("tokenizeProperty() error:", error);
			} else {
				console.log("Transaction Hash:", transactionHash);
				console.log("tokenizeProperty() done");
			}
		};
};

const setProperty = async (location, value) => {
	PROPERTY.methods.setProperty(location, value).send(
		{
			from: getAccount(),
		},
		(error, transactionHash) => {
			if (error) {
				console.error("setProperty() error:", error);
			} else {
				console.log("Transaction Hash:", transactionHash);
				console.log("setProperty() done");
			}
		}
	);
};

const setPrices = async (buyPrice) => {
	PROPERTY.methods.setPrices(buyPrice).send({
		from: getAccount(),
	}),
		(error, transactionHash) => {
			if (error) {
				console.error("setPrices() error:", error);
			} else {
				console.log("Transaction Hash:", transactionHash);
				console.log("setPrices() done");
			}
		};
};

const UpdatePrices = async (buyPrice) => {
	try {
		await PROPERTY.methods.UpdatePrices(buyPrice).send({ from: getAccount() });
		console.log("UpdatePrices() done");
	} catch (error) {
		console.log(error);
	}
};

const getTransaction = async () => {
	try {
		const transactionDetails = await PROPERTY.methods.getTransaction().call({ from: getAccount() });
		console.log("transactionDetails: ", transactionDetails);
	} catch (error) {
		console.log(error);
	}
};

const getLastTransaction = async () => {
	try {
		const lastTransaction = await PROPERTY.methods.getLastTransaction().call({ from: getAccount() });
		console.log("Last transaction at:", lastTransaction);
	} catch (error) {
		console.log(error);
	}
};

const buyTokens = async (amount) => {
	const amountToSend = web3.utils.toWei(amount, "ether");
	contract.methods.buyTokens().send(
		{
			value: amountToSend,
			from: getAccount(),
		},
		(error, transactionHash) => {
			if (error) {
				console.error("Error calling buyTokens():", error);
			} else {
				console.log("Transaction Hash:", transactionHash);
			}
		}
	);
};
