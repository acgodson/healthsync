import { AppWrapper } from '@/context/ctx'
import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </AppWrapper>
  )
}
