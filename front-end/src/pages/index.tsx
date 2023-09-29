
import { useLibp2pContext } from '@/context/ctx'
import { usePeerContext } from '../context/peer-ctx'
import { Flex, useDisclosure } from '@chakra-ui/react';
import { useConnection } from '@/hooks/useConnection'
import LeftSidebar from '@/components/sidebars/leftSidebar';
import RightSidebar from '@/components/sidebars/righSidebar';
import ModalComponent from '@/components/modals/whitelistModal';
import ChatContainerr from '@/components/chat';



export default function Home() {
  const { libp2p } = useLibp2pContext()
  const { peerStats, account, whitelist } = usePeerContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connectMetaMask, allowAddress, setAllowAddress, maddr, loading, handleConnectToMultiaddr, handleMultiaddrChange, handleAddWhitelist } = useConnection()



  return (
    <>
      <Flex h="100vh">
        <LeftSidebar
          account={account}
          maddr={maddr}
          handleMultiaddrChange={handleMultiaddrChange}
          handleConnectToMultiaddr={handleConnectToMultiaddr}
          connectMetaMask={connectMetaMask}
        />

        <ChatContainerr />
        <RightSidebar account={account} libp2p={libp2p} peerStats={peerStats} whitelist={whitelist} onOpen={onOpen} />
        <ModalComponent
          isOpen={isOpen}
          onClose={onClose}
          allowAddress={allowAddress}
          handleAddWhitelist={handleAddWhitelist}
          handleAllowAddressChange={(e: any) => setAllowAddress(e.target.value)}
          loading={loading}
        />

      </Flex>

    </>
  )
}
