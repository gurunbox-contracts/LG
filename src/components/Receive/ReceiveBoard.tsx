import { Contract, } from '@ethersproject/contracts'
import { formatEther } from '@ethersproject/units'
import { utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TextBold } from '../../typography/Text'
import { useContractFunction, useEtherBalance, useEthers, useContractCall } from '@usedapp/core'
import { Container, ContentBlock, ContentRow, MainContent, Section, SectionRow } from '../base/base'
import { TextInline } from '../../typography/Text'
import { Button } from '../base/Button'
import { BorderRad, Colors } from '../../global/styles'
import { BigNumber } from 'ethers'
import { StatusAnimation } from '../Transactions/TransactionForm'

import VaultFactoryABI from '../../abi/VaultFactory.json'

export const ReceiveBoard = () => {

    const { account } = useEthers()
    const [vaultFactoryAddress, setAddress] = useState('')
    const [disabled, setDisabled] = useState(false)
    
    
    const handleClick = () => {
        setDisabled(true)
        setAddress(vaultFactoryAddress)
        localStorage.setItem('vaultFactoryAddress', vaultFactoryAddress)
        window.location.reload()
        
    }
    return(
        <ContentBlock>
            <TitleRow>
                <CellTitle>Withdraw ETH</CellTitle>
                <Select>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InputRow>
                  <AddressInput
                    id={`AddressInput`}
                    type="text"
                    placeholder="Vault Contract Address..."
                    value={vaultFactoryAddress}
                    onChange={(e) => setAddress(e.currentTarget.value)}
                    disabled={disabled}
                  />
                  <SmallButton disabled={!account || disabled} onClick={handleClick}>
                    Set 
                  </SmallButton>
                  </InputRow>
                </div> 

                </Select>
            </TitleRow>

            {/* <LabelRow>
                <Label htmlFor={`${ticker}Input`}>How much?</Label>
            </LabelRow>
            <InputComponent ticker={ticker} transaction={transaction} send={send} />
            <StatusAnimation transaction={transaction} /> */}
            
        </ContentBlock>

    )

}

const Select = styled.div`
  display: flex;
  align-items: center;
`

const SmallButton = styled(Button)`
  display: flex;
  justify-content: center;
  min-width: 95px;
  height: unset;
  padding: 8px 24px;

  &:disabled {
    color: ${Colors.Gray['600']};
    cursor: unset;
  }

  &:disabled:hover,
  &:disabled:focus {
    background-color: unset;
    color: unset;
  }
`

const Input = styled.input`
  height: 100%;
  width: 120px;
  padding: 0 0 0 24px;
  border: 0;
  border-radius: ${BorderRad.m};
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: transparent auto 1px;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px ${Colors.Black['900']};
  }
`

const CellTitle = styled(TextBold)`
  font-size: 18px;
`

const InputRow = styled.div`
  display: flex;
  margin: 0 auto;
  color: ${Colors.Gray['600']};
  align-items: center;
  border: ${Colors.Gray['300']} 1px solid;
  border-radius: ${BorderRad.m};
  overflow: hidden;
`

const FormTicker = styled.div`
  padding: 0 16px;
`

const LabelRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 32px 0 24px 0;
`

const Label = styled.label`
  font-weight: 700;
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: ${Colors.Gray['300']} 1px solid;
  padding: 16px;
`

const BalanceWrapper = styled.div`
  color: ${Colors.Gray['600']};
  font-size: 14px;
`

const SmallContentBlock = styled(ContentBlock)`
  padding: 0;
`

const IconContainer = styled.div`
  margin-right: 15px;
  height: 40px;
  width: 40px;
  float: left;
`

// const InformationRow = styled(motion.div)`
//   height: 60px;
//   font-size: 14px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   overflow: auto;
// `

const AnimationWrapper = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  margin: 10px;
`

const AddressInput = styled(Input)`
  height: 40px;
  width: 401px;
  margin-left:38px:
  padding: 0 0 0 38px;
  background-color: transparent;
`

