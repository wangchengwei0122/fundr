'use client';

import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { AppButton, AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app';
import { campaignAbi } from '@/lib/abi';

export type ProjectClaimPanelProps = {
  campaignAddress: Address;
  onSuccess?: () => void;
};

export function ProjectClaimPanel({
  campaignAddress,
  onSuccess,
}: ProjectClaimPanelProps) {
  const { isConnected } = useAccount();
  const [formError, setFormError] = useState<string | null>(null);

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const handleFinalize = useCallback(async () => {
    setFormError(null);

    if (!isConnected) {
      setFormError('Please connect your wallet before operating.');
      return;
    }

    try {
      await writeContractAsync({
        address: campaignAddress,
        abi: campaignAbi,
        functionName: 'finalize',
        args: [],
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Transaction submission failed, please try again later.');
      }
    }
  }, [campaignAddress, isConnected, writeContractAsync, onSuccess]);

  return (
    <AppCard className="w-full rounded-xl border-0 bg-card p-4 shadow-card ring-1 ring-border sm:p-6">
      <AppCardHeader className="px-0">
        <AppCardTitle className="text-base font-semibold text-foreground sm:text-lg">
          Claim Funds
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="px-0 text-xs text-muted-foreground sm:text-sm">
        <p className="mb-3 text-muted-foreground sm:mb-4">
          The campaign reached its goal. You can finalize to claim funds.
        </p>
        {formError && (
          <p className="mb-3 text-xs text-destructive">{formError}</p>
        )}
        <AppButton
          className="w-full rounded-full text-xs sm:w-auto sm:text-sm"
          onClick={handleFinalize}
          disabled={isWriting}
          glow="success"
        >
          {isWriting ? 'Processing...' : 'Finalize & Claim'}
        </AppButton>
      </AppCardContent>
    </AppCard>
  );
}
