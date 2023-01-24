import React, { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import StakingAbi from '../constants/Staking.json';
import TokenAbi from '../constants/RewardToken.json';
import { Form } from 'web3uikit';
import { ethers } from 'ethers';



function StakeDetails() {

  const { account, isWeb3Enabled } = useMoralis();
  const [rtBalance, setRtBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [earnedBalance, setEarnedBalance] = useState('0');
 

  const stakingAddress = "0xaB589C6cFe9669fDC6757aaE1F38c6cF739434Ae";
  const rewardTokenAddress = "0x722C1E924f89d4F92f5487d66F720247Ccdb3f0b";

  const { runContractFunction } = useWeb3Contract();

  let approveOptions = {
    abi: TokenAbi.abi,
    contractAddress: rewardTokenAddress,
    functionName: 'approve'
  };

  let stakeOptions = {
    abi: StakingAbi.abi,
    contractAddress: stakingAddress,
    functionName: 'stake'
  };

  let WithdrawOptions={
    abi:StakingAbi.abi,
    contractAddress:stakingAddress,
    functionName: 'withdraw'
  }

  let WithdrawRewardOptions={
    abi: StakingAbi.abi,
    contractAddress: stakingAddress,
    functionName: 'claimReward'
  };

  async function handleStakeSubmit(data) {
    const amountToApprove = data.data[0].inputResult;
    approveOptions.params = {
      amount: ethers.utils.parseEther(amountToApprove, 'ether'),
      spender: stakingAddress
    };

    const tx = await runContractFunction({
      params: approveOptions,
      onError: (error) => console.log(error),
      onSuccess: () => {
        handleApproveSuccess(approveOptions.params.amount);
      }
    });
  }

  async function withdrawStake(data) {
    const amountToWithdraw = data.data[0].inputResult;
    WithdrawOptions.params={
      amount:ethers.utils.parseEther(amountToWithdraw, 'ether'),
    }

    const tx = await runContractFunction({
      params:WithdrawOptions,
      onError:(error) => console.log(error),
    });

    await tx.wait();
    
    updateUiValues();
  }

  async function handleApproveSuccess(amountToStakeFormatted) {
    stakeOptions.params = {
      amount: amountToStakeFormatted
    };

    const tx = await runContractFunction({
      params: stakeOptions,
      onError: (error) => console.log(error)
    });

    await tx.wait();
    updateUiValues();
    console.log('Stake transaction complete');
  }



  const { runContractFunction: getRTBalance } = useWeb3Contract({
    abi: TokenAbi.abi,
    contractAddress: rewardTokenAddress,
    functionName: 'balanceOf',
    params: {
      account
    }
  });

  const { runContractFunction: getStakedBalance } = useWeb3Contract({
    abi: StakingAbi.abi,
    contractAddress: stakingAddress,
    functionName: 'getStaked',
    params: {
      account
    }
  });

  const { runContractFunction: getEarnedBalance } = useWeb3Contract({
    abi: StakingAbi.abi,
    contractAddress: stakingAddress,
    functionName: 'earned',
    params: {
      account
    }
  });


  const tranferRewardBalance = async () => {

    const tx = await runContractFunction({
      params:WithdrawRewardOptions,
      onError:(error) => console.log(error),
    });

    await tx.wait();
    updateUiValues();

  }

  async function updateUiValues() {
    const rtBalance = (await getRTBalance({ onError: (error) => console.log(error) })).toString();
    const formattedRtBalance = parseFloat(rtBalance) / 1e18;
    const formattedRtBalaceRounded = formattedRtBalance.toFixed(2);
    setRtBalance(formattedRtBalaceRounded);

    const stakedBalace = (await getStakedBalance({ onError: (error) => console.log(error) })).toString();
    const formattedStakedBalance = parseFloat(stakedBalace) / 1e18;
    const formattedStakedBalanceRounded = formattedStakedBalance.toFixed(2);
    setStakedBalance(formattedStakedBalanceRounded);

    const earnedBalance = (await getEarnedBalance({ onError: (error) => console.log(error) })).toString();
    const formattedEarnedBalance = parseFloat(earnedBalance) / 1e18;
    const formattedEarnedBalanceRounded = formattedEarnedBalance.toFixed(2);
    // const formattedEarnedBalanceRounded = earnedBalance;
    setEarnedBalance(formattedEarnedBalanceRounded);
  }


  useEffect(() => {

    if (isWeb3Enabled) updateUiValues();

  }, [account, getEarnedBalance, getRTBalance, getStakedBalance, isWeb3Enabled]);
  
  return (
    <div className='p-3'>
      <div className='font-bold m-2'>RT Balance is: {rtBalance}</div>
      <div className='font-bold m-2'>Earned Balance is: {earnedBalance}</div>
      <div className='font-bold m-2'>Staked Balance is: {stakedBalance}</div>
      <div className='text-black flex ml-60 mt-10'>
        <div className='m-10'>
          <Form
            onSubmit={handleStakeSubmit}
            data={[
              {
                inputWidth: '50%',
                name: 'Amount to stake ',
                type: 'number',
                value: '',
                key: 'amountToStake'
              }
            ]}
            title="Stake Now!"
          ></Form>
        </div >
        <div className='m-10'
        >
          <Form
            onSubmit={withdrawStake}
            data={[
              {
                inputWidth: '50%',
                name: 'Amount to Withdraw ',
                type: 'number',
                value: '',
                key: 'amountToWithdraw'
              }
            ]}
            title="Withdraw"
          >
          </Form>
        </div>
        <div className='m-10 px-6 py-3 w-[144] h-[185.2] rounded-2xl  bg-white '>
          <p className='text-xl font-bold leading-8 sc-fIhvWL fYVtAU'>Withdraw Reward</p>
          <button className='mt-5 ml-10 hover:bg-blue-500 bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={tranferRewardBalance} >Withdraw</button>
        </div>
      </div>
    </div>
  );
}

export default StakeDetails;