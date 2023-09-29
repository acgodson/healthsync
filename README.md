# HealthSync: Medical Imaging Collaboration on the Blockchain

`Upload >>> discuss >>>  Prepare for future marketplaces`

👉 [Watch On Youtube](https://youtu.be/VQJV7SJXne0)

## Table of Contents

- [Quick Start Guide](#quick-start-guide)
  - [Running Locally](#running-locally)
    - [Starting with localhost Rust Peer](#start-and-connect-to-a-peer-rust-based-peer)
    - [Communication on Browser](#browser-demo)
  - [How it Works](#how-it-works)
  - [Libp2p Communication](#libp2p-communication)
  - [LightHouse Access Condition](#LlghtHouse-access-conditions)
  - [Road Map](#road-map)
  - [Let's Connect](#let's-connect)

## Quick Start Quide

```bash
git clone
```

### Starting with localhost Rust Pee

```bash
cd rust-peer
cargo run
```

### Communication on Browser

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

## How it Works

Healthsync brings together Libp2p and Lighthouse.storage on filecoin to demonstrate a fast and secure communication platform for medical image collaboration.

- **Off-chain Communication**: Send text, share images, and vote on diagnoses, demoed on libp2p's universal connectivity.

- **Privacy & Encryption**: Deploys a custom smart contract on filecoin to maintain whitelist ( and future erc721 transfers). This is employed as a condition  for viewing and sharing files.

- **Perpetual Storage**: Shared attachments are uploaded on IPFS using Lighthouse.


`In future, when a user mints a conversation containing an image/diagnosis, they can recieve royalties when this data is mined on a different marketplace`

## Libp2p Communication

![libp2p](/libp2p-hero.svg)

- **Real-time off-chain Voting**: Users vote on medical diagnoses and decisions, without delays or high gas fees.

- **Peer-to-Peer chat demo**: Subscribers share messages and interactions with each other. By Passing a JSON string with the latest timestamp, we are able track and display more interactions than sending ordinary text via libp2p

## LightHouse Access Condition

- **Share File Privately**: At the point of sending messages that bear attachments. The   attachment is ibky visble to whitelisted addresses.

- **Access Condition**: owners of erc721 of an already minted image can decrypt the image as long as the access condition exists

![before](/front-end/public/med1.png) | ![after](/front-end/public/med2.png)

## Roadmap

While our demo provides a glimpse into HealthSync's potential, we're thinking big for the future. Imagine researchers and AI models using HealthSync's vast repository of medical imagings to drive advancement in the field, amd earn contributors royalties.

## Let's Connect

Your feedback, support and ideas would be appreciated.

[![Join our Community](https://img.shields.io/discord/1234567890.svg?label=Discord&logo=Discord&colorB=7289DA&style=for-the-badge)](https://discord.gg/0xtinybird)

[![Follow us on Twitter](https://img.shields.io/twitter/follow/healthsync.svg?style=for-the-badge&logo=Twitter&colorB=1DA1F2&label=Follow%20%40AC_godson)](https://twitter.com/ac_godson)

[![Visit our Website](https://img.shields.io/badge/Visit%20our%20Website-HealthSync-green?style=for-the-badge&logo=github)](https://healthsync.io)
