const Dogs = artifacts.require("Dogs");     //Bug Found: onlyOwner not applied to setNumberOfDogs()
const DogsV2 = artifacts.require("DogsV2"); // Bug Found: setNumberOfDogs reverts even if owner
const DogsV3 = artifacts.require("DogsV3");
const Proxy = artifacts.require("Proxy");


module.exports = async function (deployer, network, accounts) {
    // Deploy contracts
    const dogs = await Dogs.new();
    const proxy = await Proxy.new(dogs.address);

    // Fool truffle that proxy contract is a Dogs contract
    let proxyDog = await Dogs.at(proxy.address);

    // Set number of dogs through the proxy contract
    await proxyDog.setNumberOfDogs(10);

    // Test
    let numberOfDogs = await proxyDog.getNumberOfDogs();
    console.log("Before update: " + numberOfDogs.toNumber());


 // SOMETIME LATER: A bug is discovered in that setNumberOfDogs
 // is not restricted by onlyOwner modifier.  DogsV2.sol code is
 // written that adds onlyOwner to setNumberOfDogs function.

    // Upgrade so that proxy uses DogsV2
    const dogsV2 = await DogsV2.new();
    proxy.upgrade(dogsV2.address);

    //Test: Upgrade still has access to original storage 
    numberOfDogs = await proxyDog.getNumberOfDogs();
    console.log("After V2 update: " + numberOfDogs.toNumber());

    // Test: Upgrade can also set number of dogs
    //
    // TEST FAILS, with a runtime error upon: migrate -reset
    // The error message is given: 'Error: Returned error: VM Exception 
    // while processing transaction: revert ...'
    //  This occurs as 'require(msg.sender == _owner)' check in the onlyOwner
    // modifier is failing since the proxy's delegatecall uses the proxy's
    // _owner variable (rather than DogsV2' _owner variable).  Since the
    // proxy doesn't currently set it's _owner variable (eg. in constructor)
    // it's _owner variable is uninitialised, the require fails and reverts!
    //
    // TO FIX: Add an init function to new version of Dogs contract (DogsV3) 
    // that (upon a delegatedcall) initialsises proxy's _owner variable.
    // [Note: This is better fix than using proxy's constructor to initialise
    // the proxy's _owner variable, since other state variables may also need
    // to be initialised in the future - in which case, this can be done by
    // updating the Functional contract's (Dog's) init function.]
    //
    // Comment out below, since it errors and stops further v3 update
/*
    await proxyDog.setNumberOfDogs(30);
    numberOfDogs = await proxyDog.getNumberOfDogs();
    console.log("After update & set: " + numberOfDogs.toNumber());
*/

 // ANOTHER UPDATE REQUIRED: To fix uninitilised _owner in Proxy contract.
 // DogsV3.sol code is developed, adding an initialise function to set
 // proxy's _owner variable. 

     // Upgrade so that proxy uses DogsV3
     const dogsV3 = await DogsV3.new();
     proxy.upgrade(dogsV3.address);

    // Fool truffle again that proxy contract has all DogsV3's functions
    // (This update is required since V3 has added a new function)
     proxyDog = await DogsV3.at(proxy.address);

     //Initialise the Proxy's state (so it has same state as DogVs3 contract)
     await proxyDog.initialise(accounts[0]);
 
    //Test: Upgrade still has access to original storage 
    numberOfDogs = await proxyDog.getNumberOfDogs();
    console.log("After V3 update: " + numberOfDogs.toNumber());

    // Test: Upgrade can now set number of dogs
    await proxyDog.setNumberOfDogs(30);
    numberOfDogs = await proxyDog.getNumberOfDogs();
    console.log("After V3 update & set: " + numberOfDogs.toNumber());

    // Test: Upgrade can't set number of dogs if not the owner
    // Successfully reverts - so now commenting out this test
    //await proxyDog.setNumberOfDogs(30, {from:accounts[1]});

};

