import { useState, useEffect, useCallback } from 'react';
import { multiaddr } from '@multiformats/multiaddr';
import { connectToMultiaddr } from '../lib/libp2p';
import { ethers } from 'ethers';
import { useLibp2pContext } from '@/context/ctx';
import { usePeerContext } from '@/context/peer-ctx';
import contractArtifact from "../components/utils/HealthSync.json"
import { useListenAddressesContext } from '@/context/listen-addresses-ctx';
import { useToast } from '@chakra-ui/react';
import { addToWhitelist } from '@/components/utils/share-utils';



export function useConnection() {
    const { peerStats, setPeerStats, account, setAccount, whitelist, setWhitelist } = usePeerContext();
    const { libp2p } = useLibp2pContext()
    const [maddr, setMultiaddr] = useState('/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiCU6Kovqrwgnlll0fx6Dtdev7v6WNejPQDThpKXP6dZ5A/p2p/12D3KooWHyRUh2DAPe1xUc9uUvdBQBPmm4GsRbLSiFknQgp7YHJi');
    const { listenAddresses, setListenAddresses } = useListenAddressesContext();
    const [loading, setLoading] = useState(false);
    const [allowAddress, setAllowAddress] = useState('');
    const toast = useToast()
    const handleConnectToMultiaddr = useCallback(
        async () => {
            if (!maddr) {
                return;
            }
            try {
                const connection = await connectToMultiaddr(libp2p)(multiaddr(maddr));
                console.log('connection: ', connection);
                return connection;
            } catch (e) {
                console.error(e);
            }
        },
        [libp2p, maddr],
    );

    const handleMultiaddrChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setMultiaddr(e.target.value);
        },
        [setMultiaddr],
    );

    const connectMetaMask = async () => {
        try {
            const { ethereum }: any = window;

            if (!ethereum) {
                console.error('MetaMask not detected. Please install MetaMask.');
                return;
            }
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


    const handleAddWhitelist = async () => {
        if (!account) return;
        if (allowAddress.trim() === '') {
            // Handle validation error
            return;
        }
        const x = await addToWhitelist(
            account,
            allowAddress,
            setLoading,
            toast,
            setWhitelist,
            setAllowAddress
        );

    };


    useEffect(() => {
        async function getList() {
            const { ethereum }: any = window;

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



    return {
        connectMetaMask,
        maddr,
        handleConnectToMultiaddr,
        handleMultiaddrChange,
        allowAddress,
        loading,
        handleAddWhitelist,
        setAllowAddress

    };
}
