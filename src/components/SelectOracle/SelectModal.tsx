import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useEthers, getExplorerAddressLink, useEtherBalance } from '@usedapp/core'
import { useSendTransaction } from '@usedapp/core'
import { utils } from 'ethers'
import { TransactionsList } from '../Transactions/History'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Colors, Shadows, Transitions, BorderRad } from '../../global/styles'
import { Button } from '../base/Button'
import { ShareIcon } from '../Transactions/Icons'
import { motion } from 'framer-motion'
import { Link } from '../base/Link'

// import { StatusAnimation } from '../Transactions/TransactionForm'

export type SelectModalProps = {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const SelectModal = ({setShowModal}: SelectModalProps) => {
    const { account } = useEthers()

    const [amount, setAmount] = useState('0')
    const [address, setAddress] = useState('')
    const [disabled, setDisabled] = useState(false)

    const { sendTransaction, state } = useSendTransaction({ transactionName: 'Send Ethereum' })

    const handleClick = () => {
        setDisabled(true)
        sendTransaction({ to: address, value: utils.parseEther(amount) })
    }

    useEffect(() => {
        if (state.status != 'Mining') {
        setDisabled(false)
        setAmount('0')
        setAddress('')
        }
    }, [state])

    return (
        <ModalBackground onClick={() => setShowModal(false)}>
            <Modal
            onClick={(e) => e.stopPropagation()}
            layout
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            >
                <TitleRow>
                    Set Oracle
                    <ClosingButton onClick={() => setShowModal(false)}>+</ClosingButton>
                </TitleRow>
                <SearchBoard>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                <InputRow>
                    
                    <AddressInput
                    id={`AddressInput`}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.currentTarget.value)}
                    disabled={disabled}
                    />
                    <SmallButton disabled={!account || disabled} onClick={handleClick}>
                    Set
                    </SmallButton>
                </InputRow>
                
                {/* <StatusAnimation transaction={state} /> */}
                </div>

                </SearchBoard>
            </Modal>
        </ModalBackground>
    )
}


const LinkWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`

const LinkIconWrapper = styled.div`
  width: 12px;
  height: 12px;
`

const BalanceWrapper = styled.div`
  margin-top: 12px;
`

const HistoryWrapper = styled.div``

const AccountAddress = styled.p`
  font-weight: 700;
  margin-bottom: 10px;
`

const ClosingButton = styled.button`
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  line-height: 1;
  width: 24px;
  height: 24px;
  transform: rotate(45deg);
  transition: ${Transitions.all};

  &:hover {
    color: ${Colors.Yellow[500]};
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 16px;
  width: 100%;
  font-size: 20px;
`

const SearchBoard = styled.div`
  display: block;
  margin: 16px;
  padding: 16px;
  border-radius: 10px;
  box-shadow: ${Shadows.main};
  background-color: ${Colors.White};
`

const Modal = styled(motion.div)`
  position: fixed;
  width: 600px;

  left: calc(50% - 300px);
  top: 100px;
  background-color: white;
  box-shadow: ${Shadows.main};
  border-radius: 10px;
  z-index: 3;
`

const ModalBackground = styled(motion.div)`
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0px;
  z-index: 2;
  background-color: rgba(235, 232, 223, 0.5);
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
