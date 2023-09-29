// ModalComponent.js
import React from 'react';
import { Text, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button } from '@chakra-ui/react';

function ModalComponent({ isOpen, onClose, allowAddress, handleAddWhitelist, handleAllowAddressChange, loading } : any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Address to Whitelist</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <br />
          <br />
          <Text fontSize="xs">Enter recipient wallet address</Text>
          <Input
            zIndex={99999999}
            placeholder="Enter address"
            value={allowAddress}
            onChange={handleAllowAddressChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" isLoading={loading} onClick={handleAddWhitelist}>
            Add to Whitelist
          </Button>
          <Button variant="ghost" ml={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ModalComponent;
