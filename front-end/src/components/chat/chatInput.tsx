import { Progress, Box, Text, Image, FormLabel, Button, VStack, HStack, IconButton, Textarea } from '@chakra-ui/react';
import React from 'react';
import { FiImage, FiTrash, FiSend } from 'react-icons/fi';

const ChatInput = ({
    selectedImages,
    caption,
    setCaption,
    handleSend,
    handleImageSelect,
    handleRemoveImage,
    uploadProgress,
    peerStats,
}: any) => {
    return (
        <>
            <Box
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
                                    {selectedImages.map((image: any, index: number) => (
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

        </>
    );
}

export default ChatInput;
