import React, { useEffect, useState } from 'react'
import { Contract, } from '@ethersproject/contracts'
import { utils } from 'ethers'
import { formatEther } from '@ethersproject/units'
import { useEtherBalance, useEthers, useContractCall, useTokenList } from '@usedapp/core'
import { Container, ContentBlock, ContentRow, MainContent, Section, SectionRow } from '../components/base/base'
import { Label } from '../typography/Label'
import { TextInline } from '../typography/Text'
import { Title } from '../typography/Title'

import { AccountButton } from '../components/account/AccountButton'
import { ReceiveBoard } from '../components/Receive/ReceiveBoard'
import ERC20ABI from '../abi/ERC20ABI.json'

import VaultFactoryABI from '../abi/VaultFactory.json'

export function Receive() {
    return(
        <MainContent>
            <Container>
                <Section>
                        <SectionRow>
                            <Title>Receive </Title> 
                            <AccountButton />
                        </SectionRow>
                        
                        <ReceiveBoard />
                        <SectionRow>
                        </SectionRow>
                    </Section>
            </Container>
        </MainContent>
    )
}