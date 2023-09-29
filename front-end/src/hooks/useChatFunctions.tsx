import { useChatContext } from '@/context/chat-ctx';
import { useLibp2pContext } from '@/context/ctx';
import { useCallback, useEffect, useState } from 'react';
import { CHAT_TOPIC } from '@/lib/constants'
import { ChatMessage } from '../lib/types';
import { addPollItem, processAndUploadImages } from '@/components/utils/chat-utils';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@libp2p/interface-pubsub'
import { usePeerContext } from '@/context/peer-ctx';
import lighthouse from '@lighthouse-web3/sdk'

export function useChatFunctions(

) {

    const { account, whitelist } = usePeerContext();
    const { messageHistory, setMessageHistory } = useChatContext();
    const [filteredArray, setFilteredArray] = useState([]);
    const { libp2p } = useLibp2pContext();
    const [caption, setCaption] = useState<string>('');
    const [selectedImages, setSelectedImages] = useState<File[] | any[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<any>({});
    const [pollOptionText, setPollOptionText] = useState("");
    const [conditionInfo, setConditionInfo] = useState<any | null>(null)

    const setChatState = (
        _caption: string,
        _selectedImages: File[],
        _uploadProgress: string | null,
        _userVotes: any,
        _pollOptionText: any,
    ) => {
        setCaption(_caption);
        setSelectedImages(_selectedImages);
        setUploadProgress(_uploadProgress);
        setUserVotes(_userVotes);
        setPollOptionText(_pollOptionText);
    };

    const progressCallback = (progressData: any) => {
        let percentageDone =
            100 - ((progressData?.total ?? 0) / (progressData?.uploaded ?? 0));
        console.log(percentageDone);
        // Update the uploadProgress state
        setUploadProgress(percentageDone.toFixed(2));
    };

    const sendMessageCallback = useCallback(async () => {
        if (caption === '') return

        if (!account) return;
        // Process and upload images to get their CIDs
        const imageCIDs: any = selectedImages.length < 1 ? "1" :
            await processAndUploadImages(selectedImages, account, progressCallback, whitelist!)

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

    }, [caption, messageHistory, setCaption, libp2p, setMessageHistory, setChatState]);


    const updateMessageCallback = useCallback(async (id: string, cid: string) => {

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
    }, [messageHistory, setMessageHistory, libp2p, CHAT_TOPIC, setChatState]);


    const voteCallback = useCallback(async (messageId: string, pollOptionId: number) => {
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
    }, [userVotes, filteredArray, messageHistory, setMessageHistory, setChatState]);


    const fetchCondition = async (cid: string) => {

        const response = await lighthouse.getAccessConditions(cid);
        const info = {
            owner: response.data.owner,
            nft: response.data.conditions,
            shared: response.data.sharedTo
        }
        console.log(response)
        setConditionInfo(info);
    }

    const addPollOption = async (id: string, setShowInputOption: any) => {
        const tx = await addPollItem(
            id,
            filteredArray,
            pollOptionText,
            setMessageHistory,
            libp2p,
            setPollOptionText,
            setShowInputOption
        );
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





    return {
        sendMessage: sendMessageCallback,
        updateMessage: updateMessageCallback,
        vote: voteCallback,
        uploadProgress,
        setChatState,
        setSelectedImages,
        selectedImages,
        caption,
        setCaption,
        filteredArray,
        userVotes,
        pollOptionText,
        setPollOptionText,
        conditionInfo,
        fetchCondition,
        addPollOption

        //others
    };
}

