import React from "react";
import Modal from "react-modal";
import { Center, Spinner, Button, Checkbox, Text, CheckboxGroup, HStack, Heading, Input, VStack } from "@chakra-ui/react";
import {
    useNFTModalState,
} from "../../hooks/useNFTModalState";
import { usePeerContext } from "@/context/peer-ctx";
import { GalleryModalProps } from "../../lib/types";



const NFTModal: React.FC<GalleryModalProps> = ({
    isOpen,
    image,
    onClose,
}) => {
    const { account, whitelist } = usePeerContext();
    const { selectedOwnership,
        setSelectedOwnership,
        minting,
        applying,
        loading,
        info,
        handleMintNFT
    } = useNFTModalState(image, account!, whitelist)



    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                content: {
                    width: 'fit-content',
                    height: 'fit-content',
                    margin: 'auto',
                },
            }}
        >

            {!loading && !info || info && info.nft.length == 0 && (
                <>
                    <VStack p={8}>
                        <Heading>Medical NFT</Heading>
                        <Text color={"red.600"}>Mint new Image</Text>
                        <Input
                            color="black"
                            placeholder='Calibrationet' readOnly={true} />
                        <VStack py={2}>
                            <Text color="teal" fontSize='sm' fontWeight={"bold"}>CID:</Text>
                            <Text fontSize={"xs"} fontWeight={"bold"}> {image}</Text>
                        </VStack>

                        <Text fontSize='sm' fontWeight={"bold"}>Ownership:</Text>
                        <CheckboxGroup value={selectedOwnership} onChange={setSelectedOwnership}>
                            <Checkbox
                                w="100%"
                                maxW="200px"
                                display={"flex"}
                                justifyContent={"left"}
                                value='onlyMe'><Text fontSize={"14px"} fontWeight={"bold"}>Only me</Text></Checkbox>
                            <Checkbox
                                w="100%"
                                maxW="200px" value='whiteList'><VStack
                                    alignItems={"flex-start"}
                                >
                                    <Text fontSize='9px'>
                                        <span style={{
                                            fontSize: "12px",
                                            fontWeight: "bold"
                                        }}>  WhiteList</span> <br />
                                        This would mint a copy to addresses currently in your whitelist. They would be able to decrypt the private NFT</Text>

                                </VStack></Checkbox>
                        </CheckboxGroup>
                    </VStack>

                    <HStack

                        justifyContent={"center"}
                        w="100%" spacing={6}>
                        <Button onClick={onClose}>Close</Button>
                        <Button
                            colorScheme='teal'
                            isLoading={minting ? true : applying ? true : false}
                            onClick={() => handleMintNFT(image, account!, onClose)}>Mint NFT</Button>
                    </HStack>

                </>
            )}

            {loading && !info && (
                <Center>
                    <Spinner />
                </Center>
            )}

            {!loading && info && info.nft.length > 0 && (
                <>
                    <VStack p={8}>
                        <Heading>Medical NFT</Heading>
                        <Text color={"teal"}>NFT address</Text>
                        <Input
                            color="black"
                            value={info.nft[0].contractAddress}
                            readOnly={true} />
                        <VStack py={2}>
                            <Text color="teal" fontSize='sm' fontWeight={"bold"}>CID:</Text>
                            <Text fontSize={"xs"} fontWeight={"bold"}> {image}</Text>
                        </VStack>

                    </VStack>

                    <HStack
                        justifyContent={"center"}
                        w="100%" spacing={6}>
                        <Button onClick={onClose}>Close</Button>
                        <a href={`https://calibration.filscan.io/en/address/${info.nft[0].contractAddress}/`} target='_blank'>
                            <Button
                                colorScheme='teal'
                                isLoading={minting ? true : applying ? true : false}
                            >View in Explorer</Button>
                        </a>
                    </HStack>

                </>
            )}


        </Modal>
    );
};

export default NFTModal;
