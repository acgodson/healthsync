import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Setters } from "../lib/types";
import { mintNFT, applyAccessConditions, fetchAccessConditions } from "@/components/utils/share-utils";




export const useNFTModalState = (image: string, account: string, whitelist: any) => {
    const [selectedOwnership, setSelectedOwnership] = useState<any>("onlyMe"); // Default to "only me"
    const [minting, setMinting] = useState(false);
    const [applying, setApplying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<any | null>(null);


    const setModalState: Setters = (
        _minting,
        _applying,
        _info,
        _loading
    ) => {
        setSelectedOwnership("onlyMe");
        setMinting(_minting);
        setApplying(_applying);
        setInfo(_info);
        setLoading(_loading);
    };

    const handleMintNFT = async (image: string, account: string, onClose: () => void) => {

        // Mint NFT
        const nft = await mintNFT(image, selectedOwnership, setMinting, toast, account, whitelist);

        if (nft) {
            console.log("Returned wallet address:", nft);
            applyAccessConditions(image, nft, setApplying, toast, setInfo, onClose, account, setLoading);
        }
    };


    const toast = useToast();

    useEffect(() => {
        if (loading && account) {
            fetchAccessConditions(image, setInfo, setLoading, toast, account);
        }
    },);


    return {
        selectedOwnership,
        minting,
        applying,
        loading,
        info,
        setModalState,
        handleMintNFT,
        setInfo,
        setSelectedOwnership
    };
};


