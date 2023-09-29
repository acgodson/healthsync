// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC721 NFT contract
contract HealthSyncNFT is ERC721Enumerable, Ownable {
    string public metadataCID;
    uint256 private tokenCount = 0;

    constructor(
        string memory name,
        string memory symbol,
        string memory _metadataCID
    ) ERC721(name, symbol) {
        metadataCID = _metadataCID;
    }

    // Mint new NFT with a custom tokenId
    function mint(address recipient) external onlyOwner {
        uint256 tokenId = tokenCount + 1; // Increment token ID
        _mint(recipient, tokenId); // Mint the NFT with the specified tokenId
        tokenCount++;
    }

    // Function to get all current owners of NFTs
    function getAllOwners() external view returns (address[] memory) {
        address[] memory owners = new address[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            owners[i] = ownerOf(i + 1); // Increment token ID
        }

        return owners;
    }
}

// Factory contract to create new NFTs. This code is not production
contract HealthSyncNFTFactory {
    event NFTContractDeployed(address newNFT, address author);
    mapping(string => address) public nftContractsByCID;

    function createNFT(
        string memory name,
        string memory symbol,
        string memory metadataCID,
        address[] memory initialOwners // Add an array of initial owners
    ) external returns (address) {
        HealthSyncNFT newNFTContract = new HealthSyncNFT(
            name,
            symbol,
            metadataCID
        );

        // Mint NFTs for initial owners
        for (uint256 i = 0; i < initialOwners.length; i++) {
            newNFTContract.mint(initialOwners[i]);
        }

        nftContractsByCID[metadataCID] = address(newNFTContract);

        address author = msg.sender;

        emit NFTContractDeployed(address(newNFTContract), author);
        return address(newNFTContract);
    }

    // Function to find a contract address by metadata CID
    function findContractByCID(
        string memory metadataCID
    ) external view returns (address) {
        return nftContractsByCID[metadataCID];
    }
}
