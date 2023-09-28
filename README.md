...refactoring code base!

# HealthSync: Medical Imaging Collaboration on the Blockchain

`Upload >>> discuss >>>  Prepare for future marketplaces`

👉 [Watch On Youtube](https://youtu.be/VQJV7SJXne0)

## Table of Contents

- [Quick Start Guide](#quick-start-guide)
  - [Running Locally](#running-locally)
    - [Start and Connect to a Peer (Rust-based Peer)](#start-and-connect-to-a-peer-rust-based-peer)
    - [Browser Demo](#browser-demo)
  - [How HealthSync Works](#how-healthsync-works)
  - [Advantages of Libp2p Communication](#advantages-of-libp2p-communication)
  - [The Future of HealthSync](#the-future-of-healthsync)
  - [Flow Diagram](#flow-diagram)
  - [Get Involved](#get-involved)
  - [Connect with Us](#connect-with-us)

## Testing

```bash
git clone
```

### Start and connect to a peer

```bash
cd rust-peer
cargo run
```

### Connect with browser

### 1. Install dependencies

Run npm install:

```bash
cd front-end
npm install
```

### 2. Start Next.js dev server

Start the dev server:

```
npm run dev
```

## How HealthSync Works

Combining Filecoin testnet, Libp2p, and Lighthouse to demonstrate a fast and secure communication platform for medical image collaboration.

- **Off-chain Communication**: Send text, share images seamlessly, share medical images, and vote on diagnoses over libp2p universal connectivity.

- **Privacy**: Deploys a custom smart contract on filecoin to maintain whitelist ( and future erc721 transfers). This is used as parameters for sharing files and setting access control on lighthouse.storage.

- **Encrypted Storage**: Shared medical images are encrypted and securely stored on IPFS using Lighthouse ensuring only authorized users can view them.

- **Prepared for future NFTs**: Messages are JSON strings and images stored on IPFS are compatible with On-chain NFT metadata formats.

`When a user mints a conversation containing image and diagnosis options, they can recieve royalties when data miners purchase the image on a different marketplace`

## Advantages of Libp2p on HealthSync

-**Real-time off-chain Voting**: Seamless voting on medical diagnoses and decisions, without delays or high gas fees.

-**Peer-to-Peer Connectivity**: Users can connect directly with mutuals subscribed to the same topic, no intermediaries and data routing.

## The Future of HealthSync

While our demo provides a glimpse into HealthSync's potential, we're thinking big for the future. Imagine researchers and AI models using HealthSync's vast repository of medical imaging NFTs to drive advancements in the field while maintaining top-notch security and rewarding contributors with royalties.

## Let's Connect

Your feedback, support and ideas would be appreciated.

[![Join our Community](https://img.shields.io/discord/1234567890.svg?label=Discord&logo=Discord&colorB=7289DA&style=for-the-badge)](https://discord.gg/healthsync)

[![Follow us on Twitter](https://img.shields.io/twitter/follow/healthsync.svg?style=for-the-badge&logo=Twitter&colorB=1DA1F2&label=Follow%20%40healthsync)](https://twitter.com/acgodson_ng)

[![Visit our Website](https://img.shields.io/badge/Visit%20our%20Website-HealthSync-green?style=for-the-badge&logo=github)](https://healthsync.io)
