import React from 'react';
import { Box, VStack, Text, Avatar, Badge, Flex, Divider, HStack, Button, Spacer } from '@chakra-ui/react';
import { CheckCircleIcon, } from '@chakra-ui/icons';
import { XCircleIcon } from '@heroicons/react/20/solid';

function RightSidebar({ account, libp2p, peerStats, whitelist, onOpen }: any) {
    return (
        <Box w="250px" p="4" bg="gray.200" position="fixed" h="100vh" right={0}>
            <VStack align="start" spacing="3">
                <Text bg="white" px={4} py={2} borderRadius="15px" fontSize="sm">
                    {account ? `${account?.slice(0, 3)}...${account?.slice(38)}` : ''}
                </Text>
                <Flex align="center">
                    <Avatar size="sm" name="this peer-id" src="#" />
                    <Text fontSize="xs" fontWeight="semibold" ml={2}>PeerID: {libp2p.peerId.toString()}</Text>
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
                    <Text>Whitelist:</Text>
                    <Button h="30px" fontSize="sm" colorScheme="green" onClick={onOpen}>
                        Add
                    </Button>
                </HStack>
                {whitelist && whitelist.length > 0 && whitelist.map((ma: any, index: number) => (
                    <Flex key={`ma-${index}`} align="center">
                        <Avatar size="sm" name={ma.toString().slice(0, 30)} src="#" />
                        <Text fontSize="xs" ml={2}>
                            {ma?.slice(0, 9)}...{ma?.slice(38)}
                        </Text>
                        <Spacer />
                    </Flex>
                ))}
            </VStack>
        </Box>
    );
}

export default RightSidebar;
