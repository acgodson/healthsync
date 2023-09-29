import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import { NFTContract } from '../../../config'
import NFTArtifact from "../../components/utils/HealthSyncNFT.json";
import contractArtifact from "../../components/utils/HealthSync.json"


export const fetchAccessConditions = async (
    image: string,
    setInfo: (info: any | null) => void,
    setLoading: (loading: boolean) => void,
    toast: any,
    account: string
) => {
    // Ensure that 'account' is defined in your context
    if (!account) return;
    try {
        setLoading(true);
        const response = await lighthouse.getAccessConditions(image);
        const _info = {
            owner: response.data.owner,
            nft: response.data.conditions,
            shared: response.data.sharedTo,
        };
        setInfo(_info);
        setLoading(false);
    } catch (e) {
        setLoading(false);
        toast({
            status: "error",
            description: "Can't retrieve details at the moment",
        });
    }
};

export const mintNFT = async (
    cid: string,
    selectedOwnership: string,
    setMinting: (minting: boolean) => void,
    toast: any,
    account: string,
    whitelist: any
) => {

    if (!account) return null;
    const { ethereum }: any = window;

    if (!ethereum) {
        alert("Please install MetaMask");
        return null;
    }


    const provider = new ethers.BrowserProvider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
        NFTContract,
        NFTArtifact.abi,
        await signer
    );

    const name = "medNFT";
    const symbol = "HSync";
    const metadata = cid;
    const recipient =
        selectedOwnership === "onlyMe" ? [account] : whitelist;

    try {
        setMinting(true);
        const tx = await contract.createNFT(
            name,
            symbol,
            metadata,
            recipient
        );
        await tx.wait();

        // Find the contract address by CID
        const foundAddress = await contract.findContractByCID(cid);
        setMinting(false);
        return foundAddress;
    } catch (error: any) {
        setMinting(false);
        console.error("Error minting NFT:", error.message);
        toast({
            status: "error",
            title: `Error minting NFT: ${error}`,
        });
        return null;
    }
};

export const applyAccessConditions = async (
    cid: string,
    address: string,
    setApplying: (applying: boolean) => void,
    toast: any,
    setInfo: (info: any | null) => void,
    onClose: () => void,
    account: string,
    setLoading: (info: any | null) => void,
) => {

    if (!account || !address || address.length < 3) {
        toast({
            status: "error",
            description: "Invalid NFT address",
        });
        return;
    }

    try {
        setApplying(true);

        const { publicKey, signedMessage }: any = await encryptionSignature(account);

        // Conditions to add
        const conditions = [
            {
                id: 1,
                chain: "Calibration",
                method: "balanceOf",
                standardContractType: "ERC721",
                contractAddress: address.toString(),
                returnValueTest: { comparator: ">=", value: "1" },
                parameters: [":userAddress"],
            },
        ];

        const aggregator = "([1])";

        const response = await lighthouse.applyAccessCondition(
            publicKey,
            cid,
            signedMessage,
            conditions,
            aggregator
        );

        setApplying(false);
        toast({
            status: "success",
            description: "NFT minted and access condition applied successfully",
        });

        setInfo(null);
        setLoading(true);
        onClose();
    } catch (e) {
        setApplying(false);
        console.error("Error minting NFT:", e);
        toast({
            status: "error",
            title: `Error minting NFT: ${e}`,
        });
    }
};

export const encryptionSignature = async (account: string) => {
    const { ethereum }: any = window;

    if (!account) return;

    if (!ethereum) {
        alert("Please install MetaMask");
        return null;
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = provider.getSigner();
    const address = await (await signer).getAddress();
    const messageRequested = (
        await lighthouse.getAuthMessage(address)
    ).data.message;
    const signedMessage = await (await signer).signMessage(messageRequested);

    return {
        signedMessage: signedMessage,
        publicKey: address,
    };
};


export const addToWhitelist = async (account: string, address: string, setLoading: any, toast: any, setWhitelist: any, setAllowAddress: any) => {
    if (!account) return

    const { ethereum }: any = window;
    if (ethereum) {
        setLoading(true)
        try {
            // Connect to your contract (replace with your contract's address and ABI)
            const contractAddress = "0x01598C9Aa85185a8820A7B2694aE56963a1a284e";
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractArtifact.abi, await signer);
            const tx = await contract.addToWhitelist(ethers.getAddress(address));
            await tx.wait()
            toast({
                status: "success",
                title: `address ${address} added to whitelist`
            });
            console.log(`address ${address} added to whitelist`);
            setWhitelist(null)
            setAllowAddress('');
            setLoading(false)

        } catch (error) {
            console.error("Error adding to whitelist:", error);
            setLoading(false)
        }

    }
}


