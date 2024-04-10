// SPDX-License-Identifier: GPL-3.0
import "./transaction.sol";
import "./executeVote.sol";

pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract Ballot {

    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
        bool votable;
        address votingAddress; 
    }

    enum State { Close, Voting, End }

    State public currentState;

    address private admin;

    RealEstateToken private retTokenContract;

    mapping(address => Voter) public voters;
    //mapping(uint256 => Proposal) public proposalID;

    Proposal[] public proposals;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier inState(State _state) {
        require(currentState == _state, "Invalid state for this action");
        _;
    }

    event StateChange(State newState);
    event SetOwner(address indexed oldOwner, address indexed newOwner);
    event OptionContractCreated(address OptioncontractAddress);
    //event executeVotingAddress(address)

    /** 
     * @dev Create a new ballot to choose one of 'proposalNames'.
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames, address retTokenAddress) public {
        admin = msg.sender;
        voters[admin].weight = 0;
        currentState = State.Close;
        retTokenContract = RealEstateToken(retTokenAddress);

        /*for (uint i = 0; i < proposalNames.length; i++) {
            bool votable = (i > 0); 
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
                votable: votable
            }));
        }
        */
        for (uint i = 0; i < proposalNames.length; i++) {
        Proposal memory newProposal;
        if (i == 0) {
            newProposal = Proposal({
                name: proposalNames[i],
                voteCount: 0,
                votable: false,
                votingAddress: address(0)
            });
        } else {
            newProposal = Proposal({
                name: proposalNames[i],
                voteCount: 0,
                votable: true,
                votingAddress: proposals[i].votingAddress
            });
        }
        proposals.push(newProposal);
    }
    }

    /** 
     * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
     * @param voter address of voter
     */

    function giveRightToVote(address voter) public {
        //require(
        //    msg.sender == admin,
        //    "Only admin can give right to vote."
        //);
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        require(validateRETTokenAmount(voter,1), "you don't have enough token for voting");
        voters[voter].weight = 1;
    }

    function validateRETTokenAmount(address holder,uint256 requiredAmount) public view returns (bool) {
        uint256 balance = retTokenContract.balanceOf(holder);
        return balance >= requiredAmount;
    }

    function changeOwner(address newOwner) public onlyAdmin {
        emit SetOwner(admin, newOwner);
        admin = newOwner;
    }

    function createProposal(uint256 _price) public {
        VoteOption newOptionContract = new VoteOption(_price);
        address newOptionAddress = address(newOptionContract); 
        emit OptionContractCreated(newOptionAddress);
    }

    function addProposal(bytes32 _name, address _votingAddress) public inState(State.Close) {
        proposals.push(Proposal(_name, 0, true, _votingAddress));
    }

    function startVoting() public onlyAdmin inState(State.Close) {
        require(proposals.length > 0, "No proposal registered");
        currentState = State.Voting;
        emit StateChange(currentState);
    }
    
    function endVoting() public onlyAdmin inState(State.Voting) {
        currentState = State.End;
        emit StateChange(currentState);
        uint256 winningProposalIndex = winningProposal();
        address winningContractAddress = proposals[winningProposalIndex].votingAddress;

        if (winningContractAddress != address(0)) {
        VoteOption winningContract = VoteOption(winningContractAddress);
        winningContract.updatePrice();
    }
    }
    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of voteshjjk,
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /**
     * @dev Give your vote (including votes delegated to you) to proposal 'proposals[proposal].name'.
     * @param proposal index of proposal in the proposals array
     */

    function vote(uint proposal) public inState(State.Voting){
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    
    function impeachment(address voter) public view{
        require(!voters[voter].voted, "The voter already voted.");
        require(validateRETTokenAmount(voter,1), "you don't have enough token for voting");
        uint256 agreeVotes = proposals[0].voteCount;
        uint256 againstVotes = proposals[1].voteCount;

        if (agreeVotes > againstVotes) {
        // Impeachment passed
        // This could involve removing the admin or updating their role
        } else {
        // Impeachment failed
        // Implement necessary actions here
        }
        }

    /** 
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal() public view inState(State.End)
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /** 
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }

    function getProposalNames() public view returns (bytes32[] memory) {
        bytes32[] memory names = new bytes32[](proposals.length);

        for (uint256 i = 0; i < proposals.length; i++) {
        names[i] = proposals[i].name;
    }

    return names;
    }

    function getVoteCount(uint index) public view returns(uint){
        return proposals[index].voteCount;
    }
}

contract Convertor{

    function stringToBytes32(string memory _string) public pure returns (bytes32) {
        bytes32 result;
        assembly {
            result := mload(add(_string, 32))
        }
        return result;
    }

    function stringArrayToBytes32Array(string[] memory _strings) public pure returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](_strings.length);

        for (uint256 i = 0; i < _strings.length; i++) {
        bytes32 convertedValue = stringToBytes32(_strings[i]);
        result[i] = convertedValue;
    }

    return result;
}
}