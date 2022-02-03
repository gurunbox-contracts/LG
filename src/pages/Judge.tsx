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
import { SelectButton } from '../components/SelectOracle/SelectButton'
import { JudgeBoard } from '../components/Judge/JudgeBoard'
import { TrusteeBoard } from '../components/Judge/TrusteeBoard'
import ERC20ABI from '../abi/ERC20ABI.json'

import VaultFactoryABI from '../abi/VaultFactory.json'


export function Judge() {
        return (
            <MainContent>
                <Container>
                    <Section>
                        <SectionRow>
                            <Title>Judge </Title> 
                            <AccountButton />
                        </SectionRow>
                        
                        <JudgeBoard />
                        <SectionRow>
                        </SectionRow>
                    </Section>
                </Container>
            </MainContent>
        )
    }
    



