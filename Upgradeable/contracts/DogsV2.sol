// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

import "./Storage.sol";

// This is a functional (facet) contract
// DogsV2 has bug fix of adding onlyOwner to setNumberOfDogs()

contract DogsV2 is Storage {

    // *** IMPORTANT: REMEMBER NOT TO CREATE ANY STATE VARIABLES   ***   
    // ***    OTHERWISE PROXY CONTRACT MEMORY MAY BE OVERWRITTEN!  ***

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    constructor() public {
        _owner = msg.sender;
    }

    function getNumberOfDogs() public view returns(uint256) {
        return _uintStorage["Dogs"];
    }

    function setNumberOfDogs(uint256 toSet) public onlyOwner {
        _uintStorage["Dogs"] = toSet;
    }
}