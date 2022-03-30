# Little Guardians Protocol

## Diagram
![](Diagram.svg)

## Structure
![](structure.drawio.svg)

## Overview
Little Guaidians is the protocol for social recovery.

Owner of ERC20 tokens, ERC721 tokens, ERC1155tokens and wrapped native asset like WETH can create Contract, set receivers, trustees and graceperiod(e.g.3 months), and approve this contract about their own assets.
Receivers will be able to withdraw owner's assets from owner's wallet after trustees permit and the graceperiod has passed.

Owner can set same address as trustees and receivers.
Trustees and receivers can only recovery approved assets, not secret key.


## Test
Initiate and Install hardhat.
Try test.

```shell
npm init --yes
npm install --save-dev hardhat
npx hardhat test
```
