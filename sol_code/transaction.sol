pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

contract RealEstateTokenNatory{
    address [] public registeredProperties;
    event ContractCreated(address contractAddress);

    function createProperty(string memory location, uint value) public {
        RealEstateToken newPropertiesContract = new RealEstateToken(msg.sender,location,value);
        address newPropertiesAddress = address(newPropertiesContract); 
                emit ContractCreated(newPropertiesAddress);
        registeredProperties.push(newPropertiesAddress);
    }
    function getDeployedProperties() public view returns (address[] memory) {
        return registeredProperties;
    }

}   

contract RealEstateToken {

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowed;

    string public name = "Real Estate Token";
    string public symbol = "RET";
    uint8 public decimals = 0;

    uint256 private _totalSupply;
    uint256 private transactionCount;

    address payable public newPropertiesAddress;
    address public owner;
    address expectedSigner = 0x1b6e16403b06a51C42Ba339E356a64fE67348e92;

    bool public isPropertyTokenized = false;

    uint256 public buyPrice;

    struct Property {
        string location;
        string buildingName;
        uint256 size;
        uint256 value;     //property's value
        bool isTokenized;
    }

    struct TransactionDetails {
        uint256 timestamp;
    }

    TransactionDetails[] public transactionHistory;
    Property public property;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event PropertyTokenized(string location, uint256 value, uint256 size, string buildingName);
    event Sent(address from, address to, uint amount);
    event BuyTokens(address buyer, uint256 amountOfWei, uint256 amountOfTokens);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(address _owner, string memory _location, uint256 _value) public  {
        owner = _owner;
        property.location = _location;
        property.value = _value;
        property.isTokenized = false;
        newPropertiesAddress = payable(address(this)); 
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return _balances[_owner];
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return _allowed[_owner][_spender];
    }

    function transfer(address _to, uint256 _value) public payable returns (bool success) {
        require(_balances[msg.sender] >= _value, "Insufficient balance");
        _balances[msg.sender] -= _value;
        _balances[_to] += _value;
        transactionHistory.push(TransactionDetails(block.timestamp));
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        _allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public payable returns (bool success) {//onlyOwner
        require(_value <= _balances[_from], "Insufficient balance (From)");
        //require(_value <= _allowed[_from][msg.sender], "Insufficient allowance");
        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowed[_from][msg.sender] -= _value;
        transactionHistory.push(TransactionDetails(block.timestamp));
        emit Transfer(_from, _to, _value);
        return true;
    }

    function tokenizeProperty(uint256 _tokens) public onlyOwner {
        require(!isPropertyTokenized, "Property already tokenized");
        require(_tokens > 0, "Token amount must be greater than zero");

        _totalSupply += _tokens; //final call
        _balances[msg.sender] += _tokens;
        property.isTokenized = true;
        isPropertyTokenized = true;

        emit PropertyTokenized(property.location, property.value, property.size, property.buildingName);
        emit Transfer(address(0), owner, _tokens);
    }

    function setProperty(string memory _location, uint256 _value) public onlyOwner {
        require(!isPropertyTokenized, "Property already tokenized");
        property.location = _location;
        property.value = _value;
    }

    function setPrices(uint256 newBuyPrice) onlyOwner public {
        buyPrice = newBuyPrice;
    }

    function UpdatePrices(uint256 newBuyPrice) external {
        buyPrice = newBuyPrice;
    }


    function getTransaction() external view returns (TransactionDetails[] memory) {
        require(transactionHistory.length > 0, "No transactions recorded");
        return (transactionHistory);
    }

    function getLastTransaction() external view returns (uint256){
        require(transactionHistory.length > 0, "No transactions recorded");
        TransactionDetails memory lastTransaction = transactionHistory[transactionHistory.length - 1];
        return (lastTransaction.timestamp);
    }
    
    function buyTokens() public payable returns (uint256 tokenAmount) {
        require(msg.value > 0, "Send ETH to buy some tokens");
        uint256 amountToBuy = msg.value / buyPrice;

    // check if the Contract has enough amount of tokens for the transaction
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance >= amountToBuy, "Vendor contract has not enough tokens in its balance");

    // Transfer token to the msg.sender
        bool success = transferFrom(address(this), msg.sender, amountToBuy);//transfer(msg.sender, amountToBuy);
        require(success, "Failed to transfer token to user");

        emit BuyTokens(msg.sender, msg.value, amountToBuy);

        return amountToBuy;
    }

    function getMessageHash(
        address _to, //address we want to send the funds to
        uint _amount, //amount we intend to send
        string memory _message, //any extra message
        uint _nonce //nonce id
    ) public pure returns (bytes32) {
        //expects a bytes32 value, which will be the hashed of the encode data. 
        return keccak256(abi.encodePacked(_to, _amount, _message, _nonce));
    }

    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function verify(
        address _signer,
        address _to,
        uint _amount,
        string memory _message,
        uint _nonce,
        bytes memory signature
    ) public pure returns (bool) {
        //Below, we are hashing the data again
        bytes32 messageHash = getMessageHash(_to, _amount, _message, _nonce);

        //We recreate the hash signature
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        
        //we then recover the public address of the signer, to see if it matches
        //our expected signer
        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }
    
    //function that recovers signer, it takes the signed message and the signature
    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }


}
