import React, { useCallback, useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { usePeerContext } from '@/context/peer-ctx';
import { useChatFunctions } from '../../hooks/useChatFunctions';
import ChatMessages from './chatMessages';
import ChatInput from './chatInput';
import ChatLayout from './chatLayout';

function ChatContainerr() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { peerStats, account } = usePeerContext();
    const { sendMessage, vote, uploadProgress, selectedImages, caption, setCaption, filteredArray, setSelectedImages, userVotes, fetchCondition, pollOptionText, setPollOptionText, conditionInfo, addPollOption } = useChatFunctions()
    const [selectedMessageId, setSelectedMessageId] = useState('');

    const handleSend = useCallback(
        async (e: any) => {
            sendMessage();
        },
        [sendMessage],
    );


    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedImages(Array.from(files));
        }
    };


    const handleRemoveImage = (indexToRemove: number) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(indexToRemove, 1);
        setSelectedImages(updatedImages);
    };

    return (
        <>
            <ChatLayout
                account={account}
                selectedImages={selectedImages}
                handleImageSelect={handleImageSelect}
                uploadProgress={uploadProgress}
            >


                <ChatMessages
                    filteredArray={filteredArray}
                    selectedMessageId={selectedMessageId}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onClose={onClose}
                    fetchCondition={fetchCondition}
                    vote={vote}
                    userVotes={userVotes}
                    account={account}
                    conditionInfo={conditionInfo}
                    pollOptionText={pollOptionText}
                    setPollOptionText={setPollOptionText}
                    addPollOption={addPollOption}
                    setSelectedMessageId={setSelectedMessageId}
                />
                <ChatInput
                    selectedImages={selectedImages}
                    caption={caption}
                    setCaption={setCaption}
                    handleSend={handleSend}
                    handleImageSelect={handleImageSelect}
                    handleRemoveImage={handleRemoveImage}
                    uploadProgress={uploadProgress}
                    peerStats={peerStats}

                />

            </ChatLayout>
        </>
    );
}

export default ChatContainerr;
