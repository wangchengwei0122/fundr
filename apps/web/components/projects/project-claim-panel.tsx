'use client';

import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full rounded-[28px] border-0 bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-900/5 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
          Claim Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 text-xs text-slate-500 sm:text-sm">
        <p className="mb-3 text-slate-600 sm:mb-4">
          The campaign reached its goal. You can finalize to claim funds.
        </p>
        {formError && (
          <p className="mb-3 text-xs text-rose-500">{formError}</p>
        )}
        <Button
          className="w-full rounded-full text-xs sm:w-auto sm:text-sm"
          onClick={handleFinalize}
          disabled={isWriting}
        >
          {isWriting ? 'Processing...' : 'Finalize & Claim'}
        </Button>
      </CardContent>
    </Card>
  );
}
