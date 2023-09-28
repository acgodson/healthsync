import React from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';

import 'react-responsive-carousel/lib/styles/carousel.min.css';

type GalleryModalProps = {
  isOpen: boolean;
  images: string[];
  onClose: () => void;
};

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, images, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          width: '80%',
          height: '80%',
          margin: 'auto',
        },
      }}
    >
      <Carousel showArrows={true} infiniteLoop={true}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Image ${index}`} />
          </div>
        ))}
      </Carousel>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default GalleryModal;
