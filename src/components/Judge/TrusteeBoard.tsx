import React, { useEffect, useState } from 'react'
import { Contract, } from '@ethersproject/contracts'
import { formatEther } from '@ethersproject/units'
import { utils } from 'ethers'
import styled from 'styled-components'
import { TextBold } from '../../typography/Text'
import { Colors, BorderRad, Transitions } from '../../global/styles'
import { useContractFunction, useEtherBalance, useEthers, useContractCall } from '@usedapp/core'
import { Container, ContentBlock, ContentRow, MainContent, Section, SectionRow } from '../base/base'
import { TextInline } from '../../typography/Text'
import { Button } from '../base/Button'
import { useSendTransaction } from '@usedapp/core'
import { BigNumber } from 'ethers'
import { SpinnerIcon, CheckIcon, ExclamationIcon } from './Icons'
import { StatusAnimation } from '../Transactions/TransactionForm'


import VaultFactoryABI from '../../abi/VaultFactory.json'

const TestToken = '0x5c3475e79D33A03dEAF9e7BEa80556943B659EE7'
const Vault = '0x779edc3dd064f82c7455558b9Fdf6DF5697a53A8'
const Owner = '0xD5c62020644823274715C0db38ABC81521594dc9'

const vaultFactoryInterface = new utils.Interface(VaultFactoryABI)
const vaultFactoryAddress = '0x94b38ff5f5A792578e4bDe6Db77Fb5d8Efb8408a'
const contract = new Contract(vaultFactoryAddress, vaultFactoryInterface)

const formatter = new Intl.NumberFormat('en-us', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})

function getTrusteeOpinion(trusteeId:string) {
    const [result]=
        useContractCall( {
            abi: vaultFactoryInterface,
            address: vaultFactoryAddress,
            method: 'trusteeOpinion',
            args: [trusteeId],
        }
        ) ?? ['N/A']
    return result
}

function getTrusteeId(account:string|null|undefined) {
    const [result]=
        useContractCall( {
            abi: vaultFactoryInterface,
            address: vaultFactoryAddress,
            method: 'trusteeIds',
            args: [account],
        }
        ) ?? ['N/A']
    return result
}

const ChangeOpinion = () => {
    const { account } = useEthers()
    const [disabled, setDisabled] = useState(false)
    const { state, send } = useContractFunction(contract, 'judge', { transactionName: 'Judge' })
    const trusteeId = formatter.format(getTrusteeId(account))
    const trusteeOpinion = getTrusteeOpinion(trusteeId)

    const judge = (TF:boolean) => {
        send(TF,trusteeId)
    }

    const handleClick = () => {
      setDisabled(true)
      const newOpinion = !trusteeOpinion ? true : false
      judge(newOpinion)
    }
  
    useEffect(() => {
      if (state.status != 'Mining') {
        setDisabled(false)
      }
    }, [state])

    
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {trusteeOpinion ?
            <SmallButton disabled={!account || disabled} onClick={handleClick}>send false</SmallButton> :
            <SmallButton disabled={!account || disabled} onClick={handleClick}>send true</SmallButton>
            }
          <StatusAnimation transaction={state} />
        </div>
    )    
}


export const TrusteeBoard = () => {
    const { account } = useEthers()
    const trusteeId = formatter.format(getTrusteeId(account))
    const trusteeOpinion = getTrusteeOpinion(trusteeId)=== true ? 'true' : 'false'
    

    return (
        <ContentBlock>
            <TitleRow>
                <CellTitle>Judge</CellTitle>
            </TitleRow>
            <ContentRow>
            </ContentRow>
            <ContentRow>
                <Label>Your Opinion:  </Label> <TextInline>{trusteeOpinion}</TextInline>
            </ContentRow>
            <ContentRow>
                <Label>Your trusteeId:  </Label> <TextInline>{trusteeId}</TextInline>
            </ContentRow>
            <ContentRow>
                <ChangeOpinion />
            </ContentRow>
        </ContentBlock>
    )
}

const CellTitle = styled(TextBold)`
  font-size: 18px;
`

const LabelRow = styled.div`
  display: flex;
  margin: 32px 0 24px 0;
`

const Label = styled.label`
  font-weight: 700;
  cursor: pointer;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    color: ${Colors.Yellow[500]};
  }
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

const Input = styled.input`
  height: 100%;
  width: 120px;
  padding: 0 0 0 24px;
  border: 0;
  border-radius: ${BorderRad.m};
  -moz-appearance: textfield;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-background-clip: text;
  }
`

const AddressInput = styled(Input)`
  width: 401px;
  padding: 0 0 0 38px;
`

const InputRow = styled.div`
  height: 44px;
  display: flex;
  margin: 0 auto;
  color: ${Colors.Gray['600']};
  align-items: center;
  border: ${Colors.Gray['300']} 1px solid;
  border-radius: ${BorderRad.m};
  overflow: hidden;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    border-color: ${Colors.Black[900]};
  }
`

const FormTicker = styled.div`
  padding: 0 8px;
`

const SmallButton = styled(Button)`
  display: flex;
  justify-content: center;
  min-width: 95px;
  height: 100%;
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
