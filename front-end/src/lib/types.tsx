


export type Setters = (
    minting: boolean,
    applying: boolean,
    info: any | null,
    loading: boolean
) => void;

export type GalleryModalProps = {
    isOpen: boolean;
    image: string;
    onClose: () => void;
};

export type ChatMessage = {
    id: string;
    image: string;
    caption: string;
    lastUpdated: number
    pollOptions: PollOption[];
};

export type PollOption = {
    id: number
    item: string;
    score: number;
};


export interface CM {
    msg: string
    from: 'me' | 'other'
    peerId: string
}

export interface MessageProps extends CM { }