import { Tooltip, Image, Text, Box, Button, Flex, HStack, IconButton, Input, VStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRocket } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import NFTModal from '../modals/NFTModal';
import { PollOption } from '../utils/types';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { decryptImage } from '../utils/chat-utils';

function ChatMessages({
    filteredArray,
    selectedMessageId,
    isOpen,
    onOpen,
    onClose,
    fetchCondition,
    vote,
    userVotes,
    account,
    conditionInfo,
    pollOptionText,
    setPollOptionText,
    addPollOption,
    setSelectedMessageId


}: any) {
    const [isNFT, setisNFT] = useState(false);
    const [decryptedImages, setDecryptedImages] = useState<any>({});
    const [showInputOption, setShowInputOption] = useState<boolean>(false);

    const openNFTModal = () => {
        setisNFT(true)
    }
    const closeNFTModal = () => {
        setisNFT(false)
    }


    const renderImage = (cid: string, messageId: string, isOpen: any, onOpen: any, onClose: any) => {
        if (decryptedImages[messageId]) {
            return (
                <>
                    <Image
                        maxH={"300px"} maxW={"auto"}
                        src={decryptedImages[messageId]}
                        alt="image"
                    />

                </>

            );
        } else {
            return (
                <>

                    <Tooltip label="Click to reveal" aria-label="Click to reveal">
                        <Image
                            opacity={0.3}
                            w="100px"
                            h="auto"
                            cursor={"pointer"}
                            src="/lock.jpg" // Replace with your placeholder image URL
                            alt="locked image"
                            onClick={() => {
                                onOpen();
                                fetchCondition(cid);
                            }
                            }
                        />

                    </Tooltip>


                    <Modal isOpen={isOpen} onClose={onClose} size="md">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Privacy</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <Text>This image is encrypted using lighthouse. Only users who have ownership or shared access can see it</Text>
                                <br />
                                <HStack>
                                    <Text fontSize={"xs"}>Author: </Text>
                                    {conditionInfo && conditionInfo.owner === account ?
                                        (<CheckCircleIcon className="inline w-6 h-6 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="w-6 h-6 text-red-500" />
                                        )
                                    }
                                </HStack>
                                <HStack>
                                    <Text fontSize={"xs"}> NFT Contract: </Text>
                                    {conditionInfo && conditionInfo.nft.length > 0 ?
                                        (<CheckCircleIcon className="inline w-6 h-6 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="w-6 h-6 text-red-500" />
                                        )
                                    }
                                </HStack>
                                <HStack>
                                    <Text fontSize={"xs"}>Shared with me: </Text>
                                    {conditionInfo && conditionInfo.shared.includes(account) ?
                                        (<CheckCircleIcon className="inline w-6 h-6 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="w-6 h-6 text-red-500" />
                                        )
                                    }
                                </HStack>



                            </ModalBody>
                            <ModalFooter >
                                <Button bg="gray"
                                    mr={5}
                                    onClick={account ? () => decryptImage(account, cid, messageId, setDecryptedImages) : () => { }}
                                >
                                    Unlock
                                </Button>
                                <a href={`https://files.lighthouse.storage/viewFile/${cid}`} target='_blank'>
                                    <Button colorScheme="blue"
                                    >
                                        View on LightHouse
                                    </Button>
                                </a>

                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </>

            );
        }
    };


    return (
        <>

            <Box w="100%"
                minH="100vh"
                pb="30vh"
                bg="#f3f4f6"
                overflowY={"auto"}
            >
                {filteredArray.map(({ msg, from, peerId }: any, idx: number) => (
                    <Box
                        key={JSON.parse(msg).id}
                        mb="4"
                        display="flex"
                        width={"100%"}
                        py={5}
                        borderTop={"0.5px solid #c4cad2"}
                        justifyContent={"center"}
                        flexDirection={"column"}
                        alignItems={"center"}

                    >
                        <Box py={3}>
                            <Box
                                h="30px"
                                w="30px"
                                borderRadius={"5px"}
                                left={"-350px"}
                                // right={0}
                                rounded="full"
                                position={"relative"}
                                bg={"gray.200"}
                            />
                        </Box>

                        <Box
                            bg="white" boxShadow={"sm"} pl={6} py={3} w="100%"
                            maxW="700px"
                        >

                            <Text pb={6} fontWeight={"semibold"} fontSize={"sm"}>{JSON.parse(msg).caption}</Text>
                            {JSON.parse(msg).image.length > 1 && (
                                <Box>{renderImage(JSON.parse(msg).image, JSON.parse(msg).id, isOpen, onOpen, onClose)}</Box>
                            )}


                            <>
                                {JSON.parse(msg).image.length > 1 && (
                                    <Text pb={1} fontWeight={"bold"} fontSize={"xs"}>Poll: Tap to Choose an appropraite option</Text>)}



                                {JSON.parse(msg).pollOptions.length > 0 && JSON.parse(msg).pollOptions.map((option: PollOption, i: number) => (
                                    <Flex
                                        py={2}
                                        onClick={
                                            !userVotes[account!] ? () => vote(JSON.parse(msg).id, option.id) :
                                                userVotes[account!] && !userVotes[account!][JSON.parse(msg).id] ? () => vote(JSON.parse(msg).id, option.id) : () => { }
                                        }

                                        as="button" mb={2}
                                        bg={
                                            !userVotes[account!] ? "teal" :
                                                userVotes[account!] && !userVotes[account!][JSON.parse(msg).id] ? "teal" : "whitesmoke"
                                        }

                                        color={
                                            !userVotes[account!] ? "white" :
                                                userVotes[account!] && !userVotes[account!][JSON.parse(msg).id] ? "white" : "teal"
                                        }
                                        fontWeight="bold"
                                        borderRadius={"10px"}
                                        boxShadow={"xs"} border="gray" px={3} w="100%" key={option.id} align="center" justify="space-between" maxW={"400px"}>
                                        <HStack>
                                            <Text fontWeight={"bold"}>{i + 1 + "."}</Text>
                                            <Text>{option.item}</Text>
                                        </HStack>
                                        <HStack>
                                            <Text>{option.score}</Text>
                                        </HStack>
                                    </Flex>
                                ))}
                            </>


                            {/* Poll Option Addition Form */}
                            {selectedMessageId === JSON.parse(msg).id && showInputOption && (
                                <Box>
                                    <VStack>
                                        <br />
                                        <Text fontSize={"xs"}>Suggest options for colleagues to vote </Text>
                                        <Input
                                            color="#333"
                                            maxW="400px"
                                            placeholder="Enter poll option"
                                            value={pollOptionText}
                                            onChange={(e) => setPollOptionText(e.target.value)}
                                        />

                                        <Button
                                            mt={5}
                                            h="30px"
                                            fontSize="sm"
                                            colorScheme='teal'
                                            onClick={() => addPollOption(JSON.parse(msg).id, setShowInputOption)}
                                        >
                                            Add Option
                                        </Button>
                                    </VStack>
                                </Box>
                            )}

                        </Box>

                        {/* Poll Option Addition Button */}
                        {account && JSON.parse(msg).image.length > 1 &&

                            (
                                <Box className="options-menu" mt={2}>
                                    <HStack>
                                        <Tooltip label="Add Poll Option" aria-label="Add Poll Option">
                                            <IconButton
                                                bg="red.700"
                                                color="white"
                                                aria-label="Add Poll Option"
                                                icon={<FiPlus />}
                                                onClick={() => {
                                                    setSelectedMessageId(JSON.parse(msg).id);
                                                    setShowInputOption(true)
                                                }}
                                            // onClick={() =>
                                            //  updateMessage(JSON.parse(msg).id, JSON.parse(msg).image)
                                            //   vote(JSON.parse(msg).id, 1)
                                            // }


                                            />
                                        </Tooltip>


                                        <Tooltip label="Mint NFT" aria-label="View Images">
                                            <IconButton
                                                bg="red.700"
                                                color="white"
                                                aria-label="Mint NFT"
                                                icon={<FaRocket />}
                                                onClick={() => openNFTModal()}
                                            />
                                        </Tooltip>
                                    </HStack>
                                    <NFTModal isOpen={isNFT} image={JSON.parse(msg).image} onClose={closeNFTModal} />
                                </Box>

                            )}

                    </Box>


                ))}
            </Box></>
    )
}

export default ChatMessages;
