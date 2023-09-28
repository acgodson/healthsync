import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ChatMessage {
	msg: string
	from: 'me' | 'other'
	peerId: string

}

type CM = {
	id: string;
	image: string;
	caption: string;
	lastUpdated: number
	// pollOptions: PollOption[];
};


export interface ChatContextInterface {
	messageHistory: ChatMessage[];
	setMessageHistory: (messageHistory: ChatMessage[]) => void;
}
export const chatContext = createContext<ChatContextInterface>({
	messageHistory: [],
	setMessageHistory: () => { }
})

export const useChatContext = () => {
	return useContext(chatContext);
};

export const ChatProvider = ({ children }: any) => {
	const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);


	// Function to get the latest updates
	const getLatestUpdates = () => {
		const latestUpdates: Record<string, CM> = {}; // Store latest updates by message ID

		// Iterate through message history
		for (const message of messageHistory) {
			const parsedMessage: any = JSON.parse(message.msg) as CM;
			const messageID = parsedMessage.id;


			// Check if the message is an update and it's newer than the stored one
			if (parsedMessage.lastUpdated && (!latestUpdates[messageID] || parsedMessage.lastUpdated > latestUpdates[messageID].lastUpdated)) {
				latestUpdates[messageID] = parsedMessage;
			}
		}

		// Convert the latest updates object back to an array
		const latestUpdatesArray: any = Object.values(latestUpdates);
		console.log(latestUpdatesArray)
		setMessageHistory(latestUpdatesArray);
	};




	return (
		<chatContext.Provider value={{ messageHistory, setMessageHistory }}>
			{children}
		</chatContext.Provider>
	);
};

