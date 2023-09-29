import React from 'react';
import { Box, Text, VStack, Center, Image, Input, Button } from '@chakra-ui/react';

function LeftSidebar({ account, maddr, handleMultiaddrChange, handleConnectToMultiaddr, connectMetaMask } : any) {
  return (
    <Box w="250px" p="4" bg="gray.200" position="fixed" h="100vh">
      <VStack align="start" spacing="3">
        <Center>
          <Image src="/libp2p-hero.svg" alt="libp2p logo" height="46" width="46" />
        </Center>
        {account ? (
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
              colorScheme="black"
              className="rounded-md bg-indigo-600 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleConnectToMultiaddr}
            >
              Connect to multiaddr
            </Button>
          </>
        ) : (
          <>
            <Button
              colorScheme="black"
              className="rounded-md bg-indigo-600 my-2 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={connectMetaMask}
            >
              Connect Wallet
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default LeftSidebar;
