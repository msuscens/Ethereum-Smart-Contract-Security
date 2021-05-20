// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

import "./Storage.sol";

contract Proxy is Storage {

    address _currentAddress;  // of Functional Contract

    constructor(address currentAddress) public {
        _currentAddress = currentAddress;
    }

    function upgrade(address newAddress) public {
        _currentAddress = newAddress;
    }

    // Fallback function (receives all unknown function calls)
    function () payable external {
        address implementation = _currentAddress;
        require(_currentAddress != address(0));
        bytes memory data = msg.data;

        // Delegatecall every function call  - so that Proxy's storage variables are used
        // (instead of the equivalently named 'functional' contract's storage variables)
        assembly {
            let result := delegatecall(gas, implementation, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default {return(ptr, size)}
        }
    }
}