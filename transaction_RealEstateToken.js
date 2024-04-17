import {
	getAddress,
	getInstance,
	getAccount,
	getWeb3,
	getStoredAddresses,
	getJson,
} from "./transaction_RealEstateTokenNatory.js";
const ABI = "./sol_ABI/transaction_RealEstateToken.json";
var web3 = getWeb3();

var PROPERTY;
var ADDRESS;
let selectedProperty;
window.addEventListener("load", async () => {
<<<<<<< HEAD
    const Btn_tokenizeProperty = document.querySelector("#tokenizeProperty");

    Btn_tokenizeProperty.addEventListener("click", async () => {
        const tokenAmount = document.querySelector("#tokenAmount").value;
        await tokenizeProperty(tokenAmount);
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

			// Connect instance automatically
			await connectProperty();
            await getPropertyData();
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
		PROPERTY = new web3.eth.Contract(data.abi, selectedElement.textContent);
		if(!PROPERTY){
			console.log("No created property");
			return;
		}
		console.log(
			"connectProperty() done\nConnected to",
			selectedElement.textContent
		);
		return true;
	} catch (error) {
		console.log("connectProperty() error: ", error);
	}
};
const getPropertyData = async () => {
	try {
		const propertyDataList = document.querySelector("#propertyDataList");
		propertyDataList.innerHTML = "";

		const data = new Map();
<<<<<<< HEAD

=======
		data.set("Owner", await PROPERTY.methods.owner().call());
>>>>>>> 6b5660b50c3d2f227b088c39f3cae561a8464d0f
		const propertyData = await PROPERTY.methods.property().call();
		const timeStamp = await web3.eth.getBlock(propertyData.blockNumber).then(block => block.timestamp);
		const creationTime = new Date(timeStamp * 1000).toUTCString();
		data.set("Creation Time", creationTime);

		data.set("Location", propertyData.location);
		data.set("Value", propertyData.value);
		data.set("isTokenized", propertyData.isTokenized);

<<<<<<< HEAD

		const dataArray = Array.from(data.entries());
		const total = dataArray.length;

		for (let i = 0; i < total; i++) {
			const [key, value] = dataArray[i];

			let listItem = "<li class='list-group-item'>" + "<div class='data-key'>" + key + ": " + "</div>" + value + "</li>";

			if (i !== total - 1) {
				listItem += "<hr class='mt-3.5 mb-3.5'>";
			}

			propertyDataList.innerHTML += listItem;
		}
=======
		const timeStamp = await web3.eth
			.getBlock(propertyData.blockNumber)
			.then((block) => block.timestamp);
		const creationTime = new Date(timeStamp * 1000).toUTCString();
		data.set("Creation Time", creationTime);

		let total = data.size;
		let index = 1;
		data.forEach(function (value, key) {
			propertyDataList.innerHTML +=
				"<li class='list-group-item '>" +
				"<div class='data-key'>" +
				key +
				": " +
				"</div>" +
				value +
				"</li><hr class='mt-3.5 mb-3.5'>";
		});
>>>>>>> 6b5660b50c3d2f227b088c39f3cae561a8464d0f
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
		const allowance = await PROPERTY.methods
			.allowance(owner, spender)
			.call();
		console.log(allowance);
	} catch (error) {
		console.log(error.message);
	}
};

const transfer = async (to, amount) => {
	try {
		const success = await PROPERTY.methods
			.transfer(to, amount)
			.send({ from: getAccount() });
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
		const success = await PROPERTY.methods
			.approve(to, amount)
			.send({ from: getAccount() });
		if (success) {
			console.log("approve() done");
		} else {
			console.log("approve() failed");
		}
	} catch (error) {
		console.log(error);
	}
};

const UpdatePrices = async (buyPrice) => {
	try {
		await PROPERTY.methods.UpdatePrices(buyPrice).send({ from: getAccount() });
		console.log("UpdatePrices() done");
	} catch (error) {
		console.log(error);
	}
};

//common functions
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

//buyer functions
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

//seller functions
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

const trasnferFrom = async (from, to, amount) => {
	try {
		const success = await PROPERTY.methods
			.trasnferFrom(from, to, amount)
			.send({ from: getAccount() });
		if (success) {
			console.log("trasnferFrom() done");
		} else {
			console.log("trasnferFrom() failed");
		}
	} catch (error) {
		console.log(error);
	}
};

<<<<<<< HEAD
const setPrices = async (buyPrice) => {
	PROPERTY.methods.setPrices(buyPrice).send({
=======
const tokenizeProperty = async () => {
	const amount = document.getElementById("#tokenizeAmount").value;

	await PROPERTY.methods.tokenizeProperty(amount).send({
>>>>>>> 6b5660b50c3d2f227b088c39f3cae561a8464d0f
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

<<<<<<< HEAD
//Vote functions
=======
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
		await PROPERTY.methods
			.UpdatePrices(buyPrice)
			.send({ from: getAccount() });
		console.log("UpdatePrices() done");
	} catch (error) {
		console.log(error);
	}
};

const getTransaction = async () => {
	try {
		const transactionDetails = await PROPERTY.methods
			.getTransaction()
			.call({ from: getAccount() });
		console.log("transactionDetails: ", transactionDetails);
	} catch (error) {
		console.log(error);
	}
};

const getLastTransaction = async () => {
	try {
		const lastTransaction = await PROPERTY.methods
			.getLastTransaction()
			.call({ from: getAccount() });
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
>>>>>>> 6b5660b50c3d2f227b088c39f3cae561a8464d0f
