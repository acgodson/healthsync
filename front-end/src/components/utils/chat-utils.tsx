
import lighthouse from "@lighthouse-web3/sdk";
import { encryptionSignature } from "./share-utils";
import { LightHouseAPIKey } from "../../../config";
import { v4 as uuidv4 } from 'uuid';
import { CHAT_TOPIC } from "@/lib/constants";


const apiKey = LightHouseAPIKey;


export async function processAndUploadImages(images: File[], account: string, progressCallback: any, whitelist: any[]) {
    const cids = [];
    // sign message for uploading image
    const { publicKey, signedMessage }: any = await encryptionSignature(account);
    const uploadResponse: any = await lighthouse.uploadEncrypted(
        images,
        apiKey,
        publicKey,
        signedMessage,
        undefined,
        progressCallback
    );

    if (uploadResponse) {
        const { Hash } = uploadResponse.data[0]
        //sign message for sharing file privately
        const { publicKey, signedMessage }: any = await encryptionSignature(account);
        const share = await shareFile(
            Hash, publicKey,
            signedMessage,
            whitelist
        )
        console.log("share access granted to whitelist", share)
        cids.push(Hash);
    }
    //return image cid
    return cids[0];
}

export async function shareFile(cid: string, pubK: string, signM: string, whitelist: any[]) {
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



export const addPollItem = async (
    messageId: string,
    filteredArray: any,
    pollOptionText: string,
    setMessageHistory: any,
    libp2p: any,
    setPollOptionText: any,
    setShowInputOption: any

) => {
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
            console.log('sent updated message to:', res.recipients.map((peerId: any) => peerId.toString()));
            setPollOptionText("");
            setShowInputOption(false)
        }
    }
};


export const decryptImage = async (account: string, cid: string,
    messageId: string,
    setDecryptedImages: any
) => {
    console.log("ready for ecryption", cid)
    const { publicKey, signedMessage }: any = await encryptionSignature(account);
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
