import React, { ReactElement, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Connection } from '@libp2p/interface-connection'
import { PeerId } from '@libp2p/interface-peer-id'


export interface PeerStats {
	peerIds: PeerId[]
	connected: boolean
	connections: Connection[]
	latency: number
}

export interface PeerContextInterface {
	peerStats: PeerStats;
	setPeerStats: (peerStats: PeerStats) => void;
	account: string | null;
	setAccount: (account: string | null) => void;
	whitelist: any[] | null;
	setWhitelist: (whitelist: any[] | null) => void;
}
export const peerContext = createContext<PeerContextInterface>({
	peerStats: {
		peerIds: [],
		connected: true,
		connections: [],
		latency: 0
	},
	setPeerStats: () => { },
	account: null,
	setAccount: () => { },
	whitelist: null,
	setWhitelist: () => { }


})

export const usePeerContext = () => {
	return useContext(peerContext);
};

export const PeerProvider = ({ children }: { children: ReactNode }) => {
	const [peerStats, setPeerStats] = useState<PeerStats>({
		peerIds: [],
		connected: false,
		connections: [],
		latency: 0
	});
	const [account, setAccount] = useState<string | null>(null);
	const [whitelist, setWhitelist] = useState<any[] | null>(null);


	useEffect(() => {

		if (!account) {

		}

	}, [])


	return (
		<peerContext.Provider value={{ peerStats, setPeerStats, account, setAccount, whitelist, setWhitelist }}>
			{children}
		</peerContext.Provider>
	);
};

