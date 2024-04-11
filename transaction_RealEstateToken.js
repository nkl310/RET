const getPropertyData = async () => {
    
}

const getTotalSupply = async () => {
    printResult("getTotalSupply() called")
    try {
        const totalSupply = await contract.methods.totalSupply().call();
        return totalSupply;
    } catch (error) {
        console.log(error.message);
    }
}

