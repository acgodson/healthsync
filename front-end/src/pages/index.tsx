import Head from 'next/head'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import Nav from '@/components/nav'
import { useLibp2pContext } from '@/context/ctx'
import type { Connection } from '@libp2p/interface-connection'
import { usePeerContext } from '../context/peer-ctx'
import { useCallback, useEffect, useState } from 'react'
// import Image from 'next/image'
import { multiaddr } from '@multiformats/multiaddr'
import { connectToMultiaddr } from '../lib/libp2p'
import { useListenAddressesContext } from '../context/listen-addresses-ctx'
import GalleryModal from '@/components/galleryModal';
import { Box, SimpleGrid, Flex, Image, Button, Spacer, VStack, Text, Avatar, Badge, HStack, IconButton, Input, Tooltip, Textarea, FormLabel, Center, Grid, Heading, Divider, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import { FiUpload, FiTrash, FiImage, FiPlus, FiExternalLink, FiSend } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import ChatContainer from '@/components/chat'
import contractArtifact from "../components/HealthSync.json"
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk'




const chatMessageContainerClass = `
  position: relative;
  &:hover .options-menu {
    display: block;
  }
`;

type ChatMessage = {
  id: string;
  images: string[];
  caption: string;
  pollOptions: PollOption[];
};

type PollOption = {
  id: string;
  text: string;
  votes: number;
};



export default function Home() {
  const { libp2p } = useLibp2pContext()
  const { peerStats, setPeerStats, account, setAccount, whitelist, setWhitelist } = usePeerContext()
  const { listenAddresses, setListenAddresses } = useListenAddressesContext()
  const [maddr, setMultiaddr] = useState('/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiCU6Kovqrwgnlll0fx6Dtdev7v6WNejPQDThpKXP6dZ5A/p2p/12D3KooWHyRUh2DAPe1xUc9uUvdBQBPmm4GsRbLSiFknQgp7YHJi')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[] | any[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [galleryModalIsOpen, setGalleryModalIsOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [pollOptionText, setPollOptionText] = useState<string>("");
  const [allowAddress, setAllowAddress] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const toast = useToast()

  const connectMetaMask = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error('MetaMask not detected. Please install MetaMask.');
        return;
      }


      // Define the desired chain information
      const chainData = {
        chainId: '0x4cb2f', // Calibration Testnet chain ID
        chainName: 'Filecoin — Calibration testnet',
        rpcUrls: ['https://filecoin-calibration.chainup.net/rpc/v1'], // Calibration Testnet RPC URL
        nativeCurrency: {
          name: 'Filecoin',
          symbol: 'tFIL',
          decimals: 18,
        },
      };


      // Check if the chain is already added, if not, add it
      const existingChainId = await ethereum.request({ method: 'eth_chainId' });


      if (existingChainId !== chainData.chainId) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainData],
        });
      }

      // Request access to accounts and chain ID
      const [selectedAccount]: any = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Set the account and chain ID in state
      setAccount(selectedAccount);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };


  const addToWhitelist = async (address: string) => {

    if (!account) return

    const { ethereum } = window;
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



  useEffect(() => {

    async function getList() {
      const { ethereum } = window;

      if (ethereum) {
        try {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = provider.getSigner();

          const Contract = new ethers.Contract("0x01598C9Aa85185a8820A7B2694aE56963a1a284e", contractArtifact.abi, await signer);

          // Call the contract's getWhitelist function to retrieve addresses in the whitelist
          const whitelistAddresses = await Contract.getWhitelist(account);

          const list: any = await new Promise(async (resolve, reject) => {
            try {
              const whitelistAddresses = await Contract.getWhitelist(account);
              const addressesArray = [];
              for (const key in whitelistAddresses) {
                if (key !== '#names') {
                  addressesArray.push(whitelistAddresses[key]);
                }
              }
              resolve(addressesArray);
            } catch (error) {
              reject(error);
            }
          });

          console.log("whitelist addresses", list)
          setWhitelist(list);

        } catch (error) {
          console.error('Error:', error);
        }
      }
    }

    if (account && !whitelist) {
      getList()

    }

  }, [account, whitelist])




  useEffect(() => {
    const interval = setInterval(() => {
      const connections = libp2p.getConnections()

      setPeerStats({
        ...peerStats,
        peerIds: connections.map(conn => conn.remotePeer),
        connections: connections,
        connected: connections.length > 0,
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [libp2p, peerStats, setPeerStats])

  useEffect(() => {
    const interval = setInterval(() => {
      const multiaddrs = libp2p.getMultiaddrs()

      setListenAddresses({
        ...listenAddresses,
        multiaddrs
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [libp2p, listenAddresses, setListenAddresses])

  type PeerProtoTuple = {
    peerId: string
    protocols: string[]
  }

  const getFormattedConnections = (connections: Connection[]): PeerProtoTuple[] => {
    const protoNames: Map<string, string[]> = new Map()

    connections.forEach((conn) => {
      const exists = protoNames.get(conn.remotePeer.toString())
      const dedupedProtonames = [...new Set(conn.remoteAddr.protoNames())]

      if (exists?.length) {
        const namesToAdd = dedupedProtonames.filter((name) => !exists.includes(name))
        // console.log('namesToAdd: ', namesToAdd)
        protoNames.set(conn.remotePeer.toString(), [...exists, ...namesToAdd])

      } else {
        protoNames.set(conn.remotePeer.toString(), dedupedProtonames)
      }
    })

    return [...protoNames.entries()].map(([peerId, protocols]) => ({
      peerId,
      protocols,
    }))
  }

  const handleConnectToMultiaddr = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!maddr) {
        return
      }

      try {
        const connection = await connectToMultiaddr(libp2p)(multiaddr(maddr))
        console.log('connection: ', connection)

        return connection
      } catch (e) {
        console.error(e)
      }
    },
    [libp2p, maddr],
  )

  // handleConnectToMultiaddr

  const handleMultiaddrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMultiaddr(e.target.value)
    },
    [setMultiaddr],
  )


  const handleAddClick = () => {

    if (allowAddress.trim() === '') {
      // Handle validation error
      return;
    }
    addToWhitelist(allowAddress);


  };


  const encryptionSignature = async () => {
    const { ethereum }: any = window;
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = provider.getSigner();
    const address = await (await signer).getAddress();
    const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
    const signedMessage = await (await signer).signMessage(messageRequested);
    return ({
      signedMessage: signedMessage,
      publicKey: address
    });
  }


  const accessConditions = async () => {
    const cid = "QmWW4mpzyQWPvx2BhS83p8XmVTeijC8BMq5xM8e5JXTZfV"; // Replace with your file's CID
    const { publicKey, signedMessage } = await encryptionSignature();

    const x = lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    )
    // Print the access conditions
    console.log(x);
  }





  // new functions
  const openGalleryModal = (images: string[]) => {
    setGalleryImages(images);
    setGalleryModalIsOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalIsOpen(false);
    setGalleryImages([]);
  };

  const selectOption = (optionId: string, messageId: string) => {
    setSelectedOption(optionId);
    setSelectedMessageId(messageId);
  };


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

  // Function to send images with captions as chat messages
  const sendImages = () => {
    if (selectedImages.length > 0 && caption) {
      const newChatMessage: ChatMessage = {
        id: uuidv4(), // Generate a unique ID for the message
        images: selectedImages.map((image) => URL.createObjectURL(image)),
        caption,
        pollOptions: [],
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setSelectedImages([]);
      setCaption('');
    }
  };


  const addPollOptionToMessage = (messageId: string, optionText: string) => {
    const updatedMessages = chatMessages.map((message) => {
      if (message.id === messageId) {
        const newOption: PollOption = {
          id: uuidv4(),
          text: optionText,
          votes: 0,
        };
        return { ...message, pollOptions: [...message.pollOptions, newOption] };
      }
      return message;
    });
    setChatMessages(updatedMessages);
  };

  const voteOption = (optionId: string, messageId: string) => {
    // Update the votes for the selected option
    // You may want to implement a server-side logic to handle this.
    // For demonstration purposes, we'll simulate it here.
    const updatedMessages = chatMessages.map((message) => {
      if (message.id === messageId) {
        const updatedOptions = message.pollOptions.map((option) => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });
        return { ...message, pollOptions: updatedOptions };
      }
      return message;
    });

    setChatMessages(updatedMessages);
    setSelectedOption(null);
    setSelectedMessageId(null);
  };





  return (
    <>

      <Flex h="100vh">

        {/* Left Sidebar - List of Rooms */}
        <Box w="250px" p="4" bg="gray.200"
          position={"fixed"}
          h="100vh"
        >
          <VStack align="start" spacing="3"
          >
            <Center>
              <Image
                src="/libp2p-hero.svg"
                alt="libp2p logo"
                height="46"
                width="46"
              />
            </Center>

            {account && (
              <>
                <Text fontWeight="bold" fontSize="2xl">HealthSync</Text>
                <Box w="35px" h="5px" bg="teal" />
                <br />
                <br />


                <Input
                  value={maddr}
                  zIndex={9999999999}
                  type="text"
                  name="peer-id"
                  id="peer-id"
                  bg="white"
                  placeholder="12D3Koo..."
                  aria-describedby="multiaddr-id-description"
                  onChange={handleMultiaddrChange}
                />

                <Button
                  colorScheme='black'
                  className="rounded-md bg-indigo-600 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={handleConnectToMultiaddr}
                >
                  Connect to multiaddr
                </Button>
              </>

            )}


            {!account && (
              <>
                <Button
                  colorScheme='black'
                  className="rounded-md bg-indigo-600 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={connectMetaMask}
                >
                  Connect Wallet
                </Button>

              </>
            )}

          </VStack>
        </Box>





        <ChatContainer />








        {/* Right Sidebar - List of Members */}
        <Box w="250px" p="4" bg="gray.200" position={"fixed"}
          h="100vh"
          right={0}
        >
          <VStack align="start" spacing="3">
            <Text bg="white"
              px={4}
              py={2}
              borderRadius={"15px"}

              fontSize="sm">{account ? account?.slice(0, 3) + "..." + account?.slice(38) : ""}</Text>

            <Flex align="center">
              <Avatar size="sm" name={"this peer-id"} src="#" />
              <Text fontSize={"xs"} fontWeight={"semibold"} ml={2}>PeerID: {libp2p.peerId.toString()}</Text>
              <Spacer />
              {peerStats.connected ? <Badge colorScheme="green">Online</Badge> : <Badge>Offline</Badge>}
            </Flex>

            <Box className="my-4 inline-flex items-center text-xl">
              Connected:{' '}
              {peerStats.connected ? (
                <CheckCircleIcon className="inline w-6 h-6 text-green-500" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
            </Box>

            <Divider />
            <HStack>
              <Text>    Whitelist:</Text>
              <Button h="30px" fontSize={"sm"} colorScheme='green' onClick={
                // accessConditions
                onOpen

              }>
                Add
              </Button>
            </HStack>

            {
              whitelist && whitelist.length > 0 && whitelist.map((ma, index) => {
                return (

                  <Flex key={`ma-${index}`} align="center">
                    <Avatar size="sm" name={ma.toString().slice(0, 30)} src="#" />
                    <Text fontSize={"xs"} ml={2}>
                      {ma?.slice(0, 9) + "..." + ma?.slice(38)}

                    </Text>
                    <Spacer />
                  </Flex>
                )
              })
            }




          </VStack>
        </Box>

        {/* Gallery Modal */}
        {/* <GalleryModal isOpen={galleryModalIsOpen} images={galleryImages} onClose={closeGalleryModal} /> */}


        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Address to Whitelist</ModalHeader>
            <ModalCloseButton />
            <ModalBody>

              <br />
              <br />
              <Text fontSize={"xs"}>Enter recipient wallet address</Text>
              <Input
                zIndex={99999999}
                placeholder="Enter address"
                value={allowAddress}
                onChange={(e) => setAllowAddress(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue"
                isLoading={loading}
                onClick={handleAddClick}>
                Add to Whitelist
              </Button>
              <Button variant="ghost" ml={3} onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Flex>



    </>
  )
}
