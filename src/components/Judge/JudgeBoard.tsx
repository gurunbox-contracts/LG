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
import { SpinnerIcon, CheckIcon, ExclamationIcon } from './Icons'
import { StatusAnimation } from '../Transactions/TransactionForm'

import VaultFactoryABI from '../../abi/VaultFactory.json'

const TestToken = '0x5c3475e79D33A03dEAF9e7BEa80556943B659EE7'
const Vault = '0x779edc3dd064f82c7455558b9Fdf6DF5697a53A8'
const Owner = '0xD5c62020644823274715C0db38ABC81521594dc9'


const vaultFactoryInterface = new utils.Interface(VaultFactoryABI)
const vaultFactoryAddress:string = String(localStorage.getItem('vaultFactoryAddress'))
// const vaultFactoryAddress = '0x94b38ff5f5A792578e4bDe6Db77Fb5d8Efb8408a'
const contract = new Contract(vaultFactoryAddress, vaultFactoryInterface)


const formatter = new Intl.NumberFormat('en-us', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})

function onlyCall(method:string) {
  const [result]=
    useContractCall( {
          abi: vaultFactoryInterface,
          address: vaultFactoryAddress,
          method: method,
          args: [],
        }
    ) ?? ['N/A']
  return result
}

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


export const JudgeBoard = () => {
  
  const { account } = useEthers()
  const trusteeId = formatter.format(getTrusteeId(account))
  const trusteeOpinion = getTrusteeOpinion(trusteeId)=== true ? 'true' : 'false'
  const owner = onlyCall('owner')
  const name = onlyCall('name')
  const condition = onlyCall('condition')=== true ? 'true' : 'false'
  const numerator = formatter.format(onlyCall('numerator'))
  const denominator = formatter.format(onlyCall('denominator'))
  const conditionCounter = formatter.format(onlyCall('conditionCounter'))
  const vaultNumber = formatter.format(onlyCall('vaultNumber'))

  
  
  const [vaultFactoryAddress, setAddress] = useState('')
  const [disabled, setDisabled] = useState(false)
  
  
  const handleClick = () => {
      setDisabled(true)
      setAddress(vaultFactoryAddress)
      localStorage.setItem('vaultFactoryAddress', vaultFactoryAddress)
      window.location.reload()
      
  }


    

    return (
      <div>
        <ContentBlock >
            <TitleRow>
              <CellTitle>Issue: {name}</CellTitle>
              <Select>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InputRow>
                  <AddressInput
                    id={`AddressInput`}
                    type="text"
                    placeholder="Oracle Contract Address..."
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
            <ContentRow>
            </ContentRow>
            {owner && (
              <ContentRow>
                <Label>Owner:</Label> <TextInline>{owner}</TextInline>
              </ContentRow>
            )}
            {vaultNumber && (
              <ContentRow>
                <Label>Receivers:</Label> <TextInline>{vaultNumber}</TextInline>
              </ContentRow>
            )}
            {condition && (
              <ContentRow>
                <Label>Condition:</Label> <TextInline>{condition}</TextInline>
              </ContentRow>
            )}
            {conditionCounter && (
              <ContentRow>
                <Label>Now Agreement:</Label>  <TextInline>{conditionCounter} / {denominator}</TextInline>
              </ContentRow>
            )}
            {numerator && denominator && (
              <ContentRow>
                <Label>Passing condition:</Label>  <TextInline>{numerator} / {denominator} </TextInline>
              </ContentRow>
            )}
        </ContentBlock>

        <SectionRow></SectionRow>

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
      </div>
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

