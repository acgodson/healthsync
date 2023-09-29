import { Box } from '@chakra-ui/react';
import React from 'react';

function ChatLayout({ children }: any) {
    return (

        <Box flex="1" display={"flex"} minH="100vh" justifyContent={"space-between"}
            flexDirection={"column"}
            alignItems={"center"}
            overflowY={"auto"}

        >
            {children}
        </Box>
    );
}

export default ChatLayout;
