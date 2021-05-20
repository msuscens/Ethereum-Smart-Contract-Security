// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

import "./Storage.sol";

// This is a functional (facet) contract
// DogsV3 has added init function - used to set _owner (fixing related bug)

contract DogsV3 is Storage {

    // *** IMPORTANT: REMEMBER NOT TO CREATE ANY STATE VARIABLES   ***   
    // ***    OTHERWISE PROXY CONTRACT MEMORY MAY BE OVERWRITTEN!  ***

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the owner!");
        _;
    }

    constructor() public {
        // Initialsie this contracts (unused) storage variables, this is
        // purely to reduce attack surface! 
        // (Note: It's not initialising proxy contract's storage variables)
        initialise(msg.sender); 
    }

    function initialise(address owner) public {
        require(!_initialised, "Already initialised!");
        _owner = owner;
        _initialised = true;
    }

    function getNumberOfDogs() public view returns(uint256) {
        return _uintStorage["Dogs"];
    }

    function setNumberOfDogs(uint256 toSet) public onlyOwner {
        _uintStorage["Dogs"] = toSet;
    }
}