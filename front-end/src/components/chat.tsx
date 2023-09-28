import { useLibp2pContext } from '@/context/ctx'
import React, { useCallback, useEffect, useState } from 'react'
import { Message } from '@libp2p/interface-pubsub'
import { CHAT_TOPIC } from '@/lib/constants'
import { createIcon } from '@download/blockies'
import { useChatContext } from '../context/chat-ctx'
import { FormLabel, Box, Text, Image, Button, VStack, HStack, IconButton, Textarea, Center, Heading, Flex, Input, Tooltip, Progress, useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid';
import { FiImage, FiTrash, FiSend, FiPlus, FiExternalLink, FiLayout } from 'react-icons/fi'
import lighthouse from '@lighthouse-web3/sdk'
import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import contractArtifact from "../components/HealthSync.json"
import { usePeerContext } from '@/context/peer-ctx'
import { FaRocket } from 'react-icons/fa';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

const apiKey = 'a7a2b5a5.89b833ffb83d4d2f9262c182ac836192'; //This is for testing. Do not expose keys in production


interface MessageProps extends CM { }


declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

type ChatMessage = {
  id: string;
  image: string;
  caption: string;
  lastUpdated: number
  pollOptions: PollOption[];
};


export interface CM {
  msg: string
  from: 'me' | 'other'
  peerId: string
}


type PollOption = {
  id: number
  item: string;
  score: number;
};


function Message({ msg, from, peerId }: MessageProps) {
  const msgref = React.useRef<HTMLLIElement>(null)
  const { libp2p } = useLibp2pContext()


  useEffect(() => {
    const icon = createIcon({
      seed: peerId,
      size: 15,
      scale: 3,
    })
    icon.className = 'rounded mr-2 max-h-10 max-w-10'
    const childrenCount = msgref.current?.childElementCount
    // Prevent inserting an icon more than once.
    if (childrenCount && childrenCount < 2) {
      msgref.current?.insertBefore(icon, msgref.current?.firstChild)
    }
  }, [peerId])

  return (
    <li ref={msgref} className={`flex ${from === 'me' ? 'justify-end' : 'justify-start'}`}>
      <div

        className="flex relative max-w-xl px-4 py-2 text-gray-700 rounded shadow bg-white"
      >
        <div className="block">
          {msg}
          <p className="italic text-gray-400">{peerId !== libp2p.peerId.toString() ? `from: ${peerId.slice(-4)}` : null} </p>
        </div>
      </div>
    </li>
  )
}


// Initialize a temporary array for message updates
const tempMessageHistory = [];

export default function ChatContainer() {
  const { libp2p } = useLibp2pContext()
  const { peerStats, setPeerStats, account, setAccount, whitelist, setWhitelist } = usePeerContext();
  const { messageHistory, setMessageHistory } = useChatContext();
  const [filteredArray, setFilteredArray] = useState([]);
  const [caption, setCaption] = useState<string>('')
  const [selectedImages, setSelectedImages] = useState<File[] | any[]>([]);
  const [fileBuffer, setFileBuffer] = useState<any>("")
  const [pubKey, setPubKey] = useState<any | null>(null)
  const [signature, setSignature] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [decryptedImages, setDecryptedImages] = useState<any>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pollOptionText, setPollOptionText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState("")
  const [showInputOption, setShowInputOption] = useState<boolean>(false);
  const [userVotes, setUserVotes] = useState<any>({}); //save in a database in future;
  const [conditionInfo, setConditionInfo] = useState<any | null>(null)







  const progressCallback = (progressData: any) => {
    let percentageDone =
      100 - ((progressData?.total ?? 0) / (progressData?.uploaded ?? 0));
    console.log(percentageDone);
    // Update the uploadProgress state
    setUploadProgress(percentageDone.toFixed(2));
  };


  const encryptionSignature = async () => {
    const { ethereum } = window;

    if (!account) return

    if (!ethereum) {
      alert("please install metamask")
    }
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = provider.getSigner();
      const address = await (await signer).getAddress();
      const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
      const signedMessage = await (await signer).signMessage(messageRequested);
      setSignature(signedMessage)
      setPubKey(address)
      return ({
        signedMessage: signedMessage,
        publicKey: address
      });
    }
  }


  //set accessCondition when minting file
  const applyAccessConditions = async (cid: string, pubK: string, signM: string) => {

    // const wait = await addToWhitelist()

    // Conditions to add
    const conditions = [{
      id: 1,
      chain: "Calibration",
      method: "isWhitelisted",
      standardContractType: "Custom",
      contractAddress: "0x01598C9Aa85185a8820A7B2694aE56963a1a284e",
      returnValueTest: {
        comparator: "==",
        value: "0"
      },
      inputArrayType: ["address"],
      parameters: [":userAddress"],
      outputType: "uint256"
    }];

    const aggregator = "([1])";
    console.log(pubK)
    console.log(signM)



    const response = await lighthouse.applyAccessCondition(
      pubK,
      cid,
      signM,
      conditions,
      aggregator,
    );

    console.log(response);
  }



  //share file
  const shareFile = async (cid: string, pubK: string, signM: string) => {
    if (!whitelist) return;
    if (whitelist && whitelist.length < 1) return
    try {
      const publicKeyUserB = whitelist;
      const shareResponse = await lighthouse.shareFile(
        pubK,
        publicKeyUserB,
        cid,
        signM
      );

      console.log(shareResponse);
    } catch (error) {
      console.log(error);
    }
  }
  async function processAndUploadImages(images: File[]) {
    const cids = [];
    const sig: any = await encryptionSignature();

    if (sig) {
      console.log("signature", sig.signedMessage)
      console.log("pubkey", sig.publicKey)
      const uploadResponse: any = await lighthouse.uploadEncrypted(
        images,
        apiKey,
        sig.publicKey,
        sig.signedMessage,
        undefined,
        progressCallback
      );

      if (uploadResponse) {
        const { Hash } = uploadResponse.data[0]
        console.log(Hash);
        const { publicKey, signedMessage }: any = await encryptionSignature();

        //apply access conditions
        // const control = await applyAccessConditions(Hash, publicKey,
        //   signedMessage)
        const share = await shareFile(
          Hash, publicKey,
          signedMessage
        )
        console.log("access control", share)
        cids.push(Hash);
      }
    }
    return cids[0];
  }



  // Function to filter and update the display array
  useEffect(() => {
    // Filter and display the latest messages based on your criteria
    // Here, you can select the latest messages as per your needs
    const latestMessages: any = messageHistory.filter((message, index, self) => {
      const currentMessage = JSON.parse(message.msg);
      const isLatest = !self.some((otherMessage, otherIndex) => {
        if (index === otherIndex) return false;
        const other = JSON.parse(otherMessage.msg);
        return currentMessage.id === other.id && currentMessage.lastUpdated < other.lastUpdated;
      });
      return isLatest;
    });

    setFilteredArray(latestMessages);
  }, [messageHistory]);



  // Effect hook to subscribe to pubsub events and update the message state hook
  useEffect(() => {
    const messageCB = (evt: CustomEvent<Message>) => {
      console.log('gossipsub console log', evt.detail)
      // FIXME: Why does 'from' not exist on type 'Message'?
      const { topic, data } = evt.detail
      const msg = new TextDecoder().decode(data)
      console.log(`${topic}: ${msg}`)

      // Append signed messages, otherwise discard
      if (evt.detail.type === 'signed') {
        setMessageHistory([...messageHistory, { msg, from: 'other', peerId: evt.detail.from.toString() }])
      }
    }

    libp2p.services.pubsub.addEventListener('message', messageCB)

    return () => {
      // Cleanup handlers 👇
      // libp2p.pubsub.unsubscribe(CHAT_TOPIC)
      libp2p.services.pubsub.removeEventListener('message', messageCB)
    }
  }, [libp2p, messageHistory, setMessageHistory]);

  const sendMessage = useCallback(async () => {
    if (caption === '') return

    // Process and upload images to get their CIDs
    const imageCIDs: any = selectedImages.length < 1 ? "1" :

      await processAndUploadImages(selectedImages)



    if (imageCIDs) {
      console.log("image cid: ", imageCIDs);
      setUploadProgress(null)

      // Create a message object with caption, links, your own ID, and messageID
      const messageObject: ChatMessage = {
        id: uuidv4(),
        caption: caption,
        image: imageCIDs,
        lastUpdated: Date.now(),
        pollOptions: []
      };

      const messageString = JSON.stringify(messageObject);

      console.log(
        'peers in gossip:',
        libp2p.services.pubsub.getSubscribers(CHAT_TOPIC).toString(),
      )

      const res = await libp2p.services.pubsub.publish(
        CHAT_TOPIC,
        new TextEncoder().encode(messageString),
      )
      console.log(
        'sent message to: ',
        res.recipients.map((peerId) => peerId.toString()),
      )

      const myPeerId = libp2p.peerId.toString()
      setMessageHistory([...messageHistory, { msg: messageString, from: 'me', peerId: myPeerId }])
      setSelectedImages([]);
      setCaption('')
    }




  }, [caption, messageHistory, setCaption, libp2p, setMessageHistory])


  const updateMessage = useCallback(async (id: string, cid: string) => {

    console.log(messageHistory);

    // Find the index of the message with the matching ID
    const messageIndex = messageHistory.findIndex((message) => JSON.parse(message.msg).id === id);

    if (messageIndex !== -1) {
      // Create the updated message object

      const msgObj: ChatMessage = {
        caption: "yellow", // Update the caption
        image: cid,
        id: id,
        lastUpdated: Date.now(),
        pollOptions: []
      }

      const messageString = JSON.stringify(msgObj);

      const myPeerId = libp2p.peerId.toString()
      let updatedMessage: any = [...messageHistory];

      updatedMessage[messageIndex] = { msg: messageString, from: 'me', peerId: myPeerId };

      console.log("updated message", updatedMessage)

      setMessageHistory(updatedMessage);


      const res = await libp2p.services.pubsub.publish(CHAT_TOPIC, new TextEncoder().encode(messageString));
      console.log('sent updated message to:', res.recipients.map((peerId) => peerId.toString()));


    } else {
      console.error('Message not found:', id);
    }
  }, [messageHistory, setMessageHistory, libp2p, CHAT_TOPIC]);





  // Function to handle user voting and update the message
  const vote = useCallback(async (messageId: string, pollOptionId: number) => {
    if (!account) return;

    // Check if the user has already voted for this message
    if (!userVotes[account]) {
      userVotes[account] = {}; // Create an empty object to store message-specific votes for the user
    }

    // Check if the user has already voted for this message
    if (!userVotes[account]) {
      userVotes[account][messageId] = [pollOptionId];
    }

    // Check if the user has already voted for this message
    if (!userVotes[account][messageId]) {
      // Add the user's vote to the data structures
      userVotes[account][messageId] = [pollOptionId]; // Initialize with an array containing the voted poll option

      // Update the vote count for the poll option
      const messagebj: any = filteredArray.find((m: any) => JSON.parse(m.msg).id === messageId);

      if (messagebj) {
        let message = JSON.parse(messagebj.msg);
        const oldPoll = JSON.parse(messagebj.msg).pollOptions.find((option: any) => option.id === pollOptionId);
        const oldPollIndex = JSON.parse(messagebj.msg).pollOptions.findIndex((option: any) => option.id === pollOptionId);

        if (oldPoll) {
          console.log("updated score", message.pollOptions)
          message.pollOptions[oldPollIndex] = {
            id: oldPoll.id,
            item: oldPoll.item,
            score: oldPoll.score += 1,
          }
          console.log(oldPoll);
          message.lastUpdated = Date.now();
        }


        const messageString = JSON.stringify(message);

        // Find the index of the message with the matching ID in filteredArray
        const messageIndex = filteredArray.findIndex((message: any) => JSON.parse(message.msg).id === messageId);
        if (messageIndex !== -1) {

          console.log("we found an updated msg", message)
          // Replace the old message with the updated one
          let updatedArray: any = [...filteredArray];

          const myPeerId = libp2p.peerId.toString()
          updatedArray[messageIndex] = { msg: messageString, from: 'me', peerId: myPeerId };
          setMessageHistory(updatedArray);

          const res = await libp2p.services.pubsub.publish(CHAT_TOPIC, new TextEncoder().encode(messageString));
          console.log('sent updated message to:', res.recipients.map((peerId) => peerId.toString()));

          // Update the user's vote for this message
          setUserVotes((prevUserVotes: any) => ({
            ...prevUserVotes,
            [account]: {
              ...prevUserVotes[account],
              [messageId]: [pollOptionId],
            },
          }));
        }
      }
    } else {
      // User has already voted for this message, you can handle this case as needed
      console.log(`User ${account} has already voted for message ${messageId}.`);
    }
  }, [userVotes, filteredArray, messageHistory, setMessageHistory]);



  // Function to add a poll item to a message with a default score of 0

  const addPollItem = async (messageId: string) => {
    if (filteredArray.length < 1) alert("kkk")
    // const messageIndex = messageHistory.findIndex((msg: any) => JSON.parse(msg.msg).id === messageId);
    const tempMessageIndex = filteredArray.findIndex((m: any) => JSON.parse(m.msg).id == messageId);
    if (tempMessageIndex != -1) {
      //@ts-ignore
      const message = JSON.parse(filteredArray[tempMessageIndex].msg);
      const newPollOption = {
        id: uuidv4(),
        item: pollOptionText,
        score: 0,
      };
      if (!message.pollOptions) {
        message.pollOptions = [];
      }
      message.pollOptions.push(newPollOption);
      message.lastUpdated = Date.now();

      const myPeerId = libp2p.peerId.toString()

      let updatedMessage: any = [...filteredArray];

      updatedMessage[tempMessageIndex] = { msg: JSON.stringify(message), from: 'me', peerId: myPeerId };
      setMessageHistory(updatedMessage);

      const res = await libp2p.services.pubsub.publish(CHAT_TOPIC, new TextEncoder().encode(JSON.stringify(message)));
      if (res) {
        console.log('sent updated message to:', res.recipients.map((peerId) => peerId.toString()));
        setPollOptionText("");
        setShowInputOption(false)
      }

    }
  };

  const handleSend = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      sendMessage()
    },
    [sendMessage],
  )


  // Function to handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedImages(Array.from(files));
    }
  };



  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(indexToRemove, 1); // Remove the image at the specified index
    setSelectedImages(updatedImages); // Update the selectedImages state
  };



  const decryptImage = async (cid: string, messageId: string) => {
    console.log("ready for ecryption", cid)

    const { publicKey, signedMessage }: any = await encryptionSignature();
    if (publicKey && signedMessage) {
      console.log("sss", publicKey)
      console.log("jjj", signedMessage)
      // return
      const keyObject: any = await lighthouse.fetchEncryptionKey(cid, publicKey, signedMessage);
      if (keyObject) {
        const info = await lighthouse.getFileInfo(cid);
        const key = keyObject.data.key
        console.log("key", key)
        const fileType = info.data.mimeType;
        console.log(fileType)
        const decrypted = await lighthouse.decryptFile(cid, key, fileType);
        const url = URL.createObjectURL(decrypted);        // Store the decrypted image URL with its message ID in the state
        setDecryptedImages((prevImages: any) => ({
          ...prevImages,
          [messageId]: url,
        }));
      }

    }

  }


  const renderImage = (cid: string, messageId: string, isOpen: any, onOpen: any, onClose: any) => {
    // const [conditions, setConditions] = useState({});

    async function fetchConditions() {
      const response = await lighthouse.getAccessConditions(cid);
      const info = {
        owner: response.data.owner,
        shared: response.data.sharedTo
      }
      console.log(info)
      setConditionInfo(info);
    }


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
                fetchConditions();
              }

                // decryptImage(cid, messageId)

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
                  <Text fontSize={"xs"}>Author: </Text>
                  {conditionInfo && conditionInfo.owner === account ?
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
                  onClick={() => decryptImage(cid, messageId)}
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


      {/* Main Chat Area */}
      <Box flex="1" display={"flex"} minH="100vh" justifyContent={"space-between"}
        flexDirection={"column"}
        alignItems={"center"}
        overflowY={"auto"}

      >


        {/* Image Input */}
        <Box
          // zIndex={"tooltip"}
          h={selectedImages.length > 0 ? "300px" : "80px"}
          flex={1}
          py={0}
          left={0}
          right={0}
          position={"fixed"}
          display={"flex"}
          justifyContent={"center"}
        >


          <Box px="2" position={'fixed'} bottom={0} w="100%"
            maxW="700px"
            bg={selectedImages.length > 0 ? "white" : "whiteAlpha.600"}
            boxShadow={selectedImages.length > 0 ? "lg" : "none"}
            pt={2}
            pb={1}
            h={selectedImages.length > 0 ? "fit-content" : "fit-content"}
            style={{
              backdropFilter: "blur(12px)"

            }}

          >

            {/* Progress Indicator */}
            {uploadProgress !== null && (
              <>
                <Text fontSize={"xs"}>Uploading ({uploadProgress + "%"})</Text>
                <Progress
                  value={parseInt(uploadProgress)}
                  size="xs"
                  colorScheme="green"
                  isAnimated
                  hasStripe
                  my={2}
                />
              </>
            )}



            {peerStats.connected && selectedImages.length < 1 && (
              <>
                <input type="file" id="imageInput" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
                <FormLabel w="100%" htmlFor="imageInput">
                  {selectedImages.length < 1 && (
                    <Button h="50px" w="100%"
                      float={"right"}
                      maxW={"200px"}
                      as="span" leftIcon={<FiImage />}
                      bg="whitesmoke"
                      border="2px solid teal"
                      color="teal"
                      cursor={"pointer"}
                    >
                      New Upload
                    </Button>
                  )}
                </FormLabel>
              </>
            )}



            {peerStats.connected && (
              <VStack px={2} spacing="2" w="100%" py="5"
                bg="whiteAlpha.400"
                style={{
                  backdropFilter: "12px"
                }}
              >

                <VStack w="100%">


                  <HStack w="100%">
                    {selectedImages.map((image, index) => (
                      <VStack key={index} align="center" position="relative">
                        <IconButton
                          aria-label="Remove Image"
                          icon={<FiTrash color="red" />}
                          position="absolute"
                          top="2px"
                          right="2px"
                          size="sm"
                          onClick={() => handleRemoveImage(index)} // Handle image removal
                        />
                        <Image src={URL.createObjectURL(image)} alt={`Selected Image ${index}`} maxH={"70px"} maxW={"70px"} />
                      </VStack>
                    ))}

                  </HStack>



                  <Textarea
                    w="100%"
                    border={"1px solid green"}
                    placeholder="Add a caption..."
                    value={caption}
                    name="message"
                    onChange={(e) => setCaption(e.target.value)}
                    size="sm"
                  />
                </VStack>

                <Button
                  // position={"absolute"}
                  zIndex={"tooltip"}
                  right={0}
                  leftIcon={<FiSend />}
                  w="80px" onClick={handleSend} colorScheme="teal" px={3} boxShadow={"md"}>
                  Send
                </Button>

              </VStack>
            )}


          </Box>
        </Box>





        {/* Chat messages */}
        <Box w="100%"
          minH="100vh"
          pb="30vh"
          bg="#f3f4f6"
          overflowY={"auto"}
        >
          {filteredArray.map(({ msg, from, peerId }, idx) => (
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
                        onClick={() => addPollItem(JSON.parse(msg).id)}
                      >
                        Add Option
                      </Button>
                    </VStack>
                  </Box>
                )}


              </Box>

              {/* Poll Option Addition Button */}
              {JSON.parse(msg).image.length > 1 &&

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
                        // onClick={() => openGalleryModal(message.images)}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>

                )}



            </Box>


          ))}
        </Box>

      </Box >


    </>

  )
}

export function RoomList() {
  return (
    <div className="border-r border-gray-300 lg:col-span-1">
      <div className="mx-3 my-3">
        <div className="relative text-gray-600">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-gray-300"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="search"
            className="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"
            name="search"
            placeholder="Search"
            required
          />
        </div>
      </div>

      <ul className="overflow-auto h-[32rem]">
        <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
        <li>
          <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
            <img
              className="object-cover w-10 h-10 rounded-full"
              src="https://github.com/2color.png"
              alt="username"
            />
            <div className="w-full pb-2">
              <div className="flex justify-between">
                <span className="block ml-2 font-semibold text-gray-600">
                  Daniel
                </span>
                <span className="block ml-2 text-sm text-gray-600">
                  25 minutes
                </span>
              </div>
              <span className="block ml-2 text-sm text-gray-600">bye</span>
            </div>
          </a>
          <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out bg-gray-100 border-b border-gray-300 cursor-pointer focus:outline-none">
            <img
              className="object-cover w-10 h-10 rounded-full"
              src="https://github.com/achingbrain.png"
              alt="username"
            />
            <div className="w-full pb-2">
              <div className="flex justify-between">
                <span className="block ml-2 font-semibold text-gray-600">
                  Alex
                </span>
                <span className="block ml-2 text-sm text-gray-600">
                  50 minutes
                </span>
              </div>
              <span className="block ml-2 text-sm text-gray-600">
                Good night
              </span>
            </div>
          </a>
          <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
            <img
              className="object-cover w-10 h-10 rounded-full"
              src="https://github.com/hannahhoward.png"
              alt="username"
            />
            <div className="w-full pb-2">
              <div className="flex justify-between">
                <span className="block ml-2 font-semibold text-gray-600">
                  Hannah
                </span>
                <span className="block ml-2 text-sm text-gray-600">6 hour</span>
              </div>
              <span className="block ml-2 text-sm text-gray-600">
                Good Morning
              </span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  )
}
