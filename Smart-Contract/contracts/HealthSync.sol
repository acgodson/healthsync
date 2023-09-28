pragma solidity ^0.8.0;

contract HealthSync {
    mapping(address => address[]) private whitelists;

    // Function to add an address to the caller's whitelist
    function addToWhitelist(address _addressToAdd) public {
        whitelists[msg.sender].push(_addressToAdd);
    }

    // Function to remove an address from the caller's whitelist
    function removeFromWhitelist(address _addressToRemove) public {
        address[] storage whitelist = whitelists[msg.sender];
        for (uint i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == _addressToRemove) {
                // Remove the address by swapping with the last element and then shortening the array
                whitelist[i] = whitelist[whitelist.length - 1];
                whitelist.pop();
                return;
            }
        }
    }

    function isWhitelisted(address userAddress) public view returns (uint256) {
        address[] storage whitelist = whitelists[userAddress];
        for (uint i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == msg.sender) {
                return 0; // 0 represents true
            }
        }
        return 1; // 1 represents false
    }

    // Function to get all addresses in the whitelist of a given address
    function getWhitelist(
        address userAddress
    ) public view returns (address[] memory) {
        return whitelists[userAddress];
    }
}
