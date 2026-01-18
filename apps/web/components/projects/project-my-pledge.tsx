'use client';

import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

import { AppButton, AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app';
import { campaignAbi } from '@/lib/abi';
import { formatEth } from '@/lib/format';

export type ProjectMyPledgeProps = {
  campaignAddress: Address;
  status: 'active' | 'successful' | 'failed' | 'cancelled';
  daysLeft: number;
  hasReachedGoal: boolean;
  onSuccess?: () => void;
};

export function ProjectMyPledge({
  campaignAddress,
  status,
  daysLeft,
  hasReachedGoal,
  onSuccess,
}: ProjectMyPledgeProps) {
  const { isConnected, address } = useAccount();
  const [formError, setFormError] = useState<string | null>(null);

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const {
    data: userPledgeData,
    refetch: refetchUserPledge,
    isPending: isReadingPledge,
  } = useReadContract({
    address: campaignAddress,
    abi: campaignAbi,
    functionName: 'pledges',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const userPledgeWei = (userPledgeData as bigint | undefined) ?? 0n;
  const userPledgeEthNum = Number(formatEther(userPledgeWei));

  const derivedStatus = status === 'active' && hasReachedGoal ? 'successful' : status;
  const canUnpledge = userPledgeWei > 0n && status === 'active' && daysLeft > 0;
  const canRefund =
    userPledgeWei > 0n && (derivedStatus === 'failed' || (daysLeft === 0 && !hasReachedGoal));

  const handleUnpledgeAll = useCallback(async () => {
    setFormError(null);

    if (!isConnected) {
      setFormError('Please connect your wallet before operating.');
      return;
    }

    if (userPledgeWei <= 0n) {
      setFormError('No pledge to unpledge.');
      return;
    }

    try {
      await writeContractAsync({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: 'unpledge',
        args: [userPledgeWei],
      });
      void refetchUserPledge();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Transaction submission failed, please try again later.');
      }
    }
  }, [campaignAddress, isConnected, userPledgeWei, refetchUserPledge, writeContractAsync, onSuccess]);

  const handleRefund = useCallback(async () => {
    setFormError(null);

    if (!isConnected) {
      setFormError('Please connect your wallet before operating.');
      return;
    }

    try {
      await writeContractAsync({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: 'refund',
        args: [],
      });
      void refetchUserPledge();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Transaction submission failed, please try again later.');
      }
    }
  }, [campaignAddress, isConnected, refetchUserPledge, writeContractAsync, onSuccess]);

  if (!isConnected || userPledgeWei <= 0n) {
    return null;
  }

  return (
    <AppCard className="w-full rounded-[28px] border-0 bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-900/5 sm:p-6">
      <AppCardHeader className="px-0">
        <AppCardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
          My Pledge
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="px-0 text-xs text-slate-500 sm:text-sm">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-slate-600">
            {isReadingPledge
              ? 'Loading...'
              : `You have pledged: ${formatEth(userPledgeEthNum)}`}
          </p>
          {formError && (
            <p className="text-xs text-rose-500">{formError}</p>
          )}
          <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
            <AppButton
              className="w-full rounded-full text-xs sm:text-sm"
              variant="secondary"
              onClick={handleUnpledgeAll}
              disabled={!canUnpledge || isWriting}
            >
              {isWriting ? 'Processing...' : 'Unpledge All'}
            </AppButton>
            <AppButton
              className="w-full rounded-full text-xs sm:text-sm"
              onClick={handleRefund}
              disabled={!canRefund || isWriting}
            >
              {isWriting ? 'Processing...' : 'Refund'}
            </AppButton>
          </div>
        </div>
      </AppCardContent>
    </AppCard>
  );
}
