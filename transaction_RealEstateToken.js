const getPropertyData = async () => {
    const owner = await contract.methods.owner().call();
    const property = await contract.methods.property().call();

    const res = [];
    res.push(owner);
    for (let i = 0; i < property.length; i++) {
        data.push(property[i]);
    }

    return res;
};

const getTotalSupply = async () => {
    try {
        const totalSupply = await contract.methods.totalSupply().call();
        return totalSupply;
    } catch (error) {
        console.log(error.message);
    }
}

const getBalanceOf = async () => {
    try {
        const balance = await contract.methods.balanceOf().call();
        return balance;
    } catch (error) {
        console.log(error.message);
    }
}