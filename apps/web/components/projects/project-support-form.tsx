'use client';

import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Address, Hash } from 'viem';
import { parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { campaignAbi } from '@/lib/abi';
import { PRESET_SUPPORT_AMOUNTS } from '@/lib/constants';

export type ProjectSupportFormProps = {
  campaignAddress: Address;
  isProjectOpen: boolean;
  onTransactionSubmitted?: (hash: Hash) => void;
  onSuccess?: () => void;
};

export function ProjectSupportForm({
  campaignAddress,
  isProjectOpen,
  onTransactionSubmitted,
  onSuccess,
}: ProjectSupportFormProps) {
  const { isConnected } = useAccount();
  const [amountInput, setAmountInput] = useState<string>('');
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<Hash | null>(null);

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const handlePresetSelect = useCallback((value: number) => {
    setAmountInput(value.toString());
    setActivePreset(value);
    setFormError(null);
    setFeedback(null);
  }, []);

  const handleAmountChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setAmountInput(event.target.value);
    setActivePreset(null);
    setFormError(null);
    setFeedback(null);
  }, []);

  const handleSupport = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);
      setFeedback(null);
      setLastTxHash(null);

      const trimmed = amountInput.trim();

      if (!trimmed) {
        setFormError('Please select or enter the support amount.');
        return;
      }

      if (!isConnected) {
        setFormError('Please connect your wallet before supporting the project.');
        return;
      }

      let weiAmount: bigint;
      try {
        weiAmount = parseEther(trimmed);
      } catch {
        setFormError('Please enter a valid amount (support up to 18 decimal places).');
        return;
      }

      if (weiAmount <= 0n) {
        setFormError('Support amount must be greater than 0.');
        return;
      }

      try {
        const hash = await writeContractAsync({
          address: campaignAddress,
          abi: campaignAbi,
          functionName: 'pledge',
          value: weiAmount,
          args: [],
        });
        setLastTxHash(hash);
        setFeedback('Transaction confirmed.');
        setAmountInput('');
        setActivePreset(null);
        onTransactionSubmitted?.(hash);
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        } else {
          setFormError('Transaction submission failed, please try again later.');
        }
      }
    },
    [amountInput, campaignAddress, isConnected, writeContractAsync, onTransactionSubmitted, onSuccess]
  );

  return (
    <form
      className="w-full rounded-[28px] bg-white p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-900/5 sm:p-6"
      onSubmit={handleSupport}
    >
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        Support the Project
      </h2>
      <p className="mt-2 text-xs text-slate-500 sm:text-sm">
        Your every support will be directly used for the project.
      </p>

      <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
        {PRESET_SUPPORT_AMOUNTS.map((amount) => {
          const isActive = activePreset === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetSelect(amount)}
              className={cn(
                'w-full rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition sm:px-4 sm:text-sm',
                'hover:border-sky-400 hover:text-sky-500',
                isActive && 'border-sky-500 bg-sky-50 text-sky-600'
              )}
              disabled={!isProjectOpen || isWriting}
            >
              {amount} ETH
            </button>
          );
        })}
      </div>

      <div className="mt-4 w-full space-y-2 sm:mt-6 sm:space-y-3">
        <label className="text-xs font-medium text-slate-500" htmlFor="support-amount">
          Custom Support Amount (ETH)
        </label>
        <Input
          id="support-amount"
          type="number"
          min="0"
          step="any"
          placeholder="0.1"
          className="h-10 w-full rounded-full border-slate-200 text-sm sm:h-11"
          value={amountInput}
          onChange={handleAmountChange}
          disabled={!isProjectOpen || isWriting}
        />
      </div>

      {formError ? (
        <p className="mt-2 text-xs text-rose-500 sm:mt-3">{formError}</p>
      ) : feedback ? (
        <p className="mt-2 text-xs text-emerald-600 sm:mt-3">
          {feedback}
          {lastTxHash ? (
            <>
              {' '}
              <span className="break-all text-[10px] text-emerald-500 sm:text-[11px]">
                {lastTxHash}
              </span>
            </>
          ) : null}
        </p>
      ) : null}

      {!isProjectOpen ? (
        <p className="mt-2 text-xs text-slate-400 sm:mt-3">
          This project has ended or is not supported.
        </p>
      ) : null}

      <Button
        className="mt-4 w-full rounded-full text-xs sm:mt-6 sm:text-sm"
        type="submit"
        disabled={!isProjectOpen || isWriting}
      >
        {isWriting ? 'Transaction Confirming...' : 'Support Now'}
      </Button>

      <p className="mt-2 text-center text-xs text-slate-400 sm:mt-3">
        Your support will be used for project execution, and cannot be refunded.
      </p>
    </form>
  );
}
