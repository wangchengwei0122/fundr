'use client';

import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Address, Hash } from 'viem';
import { parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { AppButton, AppInput } from '@/components/app';
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
      className="w-full rounded-xl bg-card p-4 shadow-card ring-1 ring-border sm:p-6"
      onSubmit={handleSupport}
    >
      <h2 className="text-base font-semibold text-foreground sm:text-lg">
        Support the Project
      </h2>
      <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
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
                'w-full rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-base sm:px-4 sm:text-sm',
                'hover:border-primary hover:text-primary',
                isActive && 'border-primary bg-primary/10 text-primary'
              )}
              disabled={!isProjectOpen || isWriting}
            >
              {amount} ETH
            </button>
          );
        })}
      </div>

      <div className="mt-4 w-full space-y-2 sm:mt-6 sm:space-y-3">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="support-amount">
          Custom Support Amount (ETH)
        </label>
        <AppInput
          id="support-amount"
          type="number"
          min="0"
          step="any"
          placeholder="0.1"
          className="h-10 w-full rounded-full border-border text-sm sm:h-11"
          value={amountInput}
          onChange={handleAmountChange}
          disabled={!isProjectOpen || isWriting}
        />
      </div>

      {formError ? (
        <p className="mt-2 text-xs text-destructive sm:mt-3">{formError}</p>
      ) : feedback ? (
        <p className="mt-2 text-xs text-success sm:mt-3">
          {feedback}
          {lastTxHash ? (
            <>
              {' '}
              <span className="break-all text-[10px] text-success/80 sm:text-[11px]">
                {lastTxHash}
              </span>
            </>
          ) : null}
        </p>
      ) : null}

      {!isProjectOpen ? (
        <p className="mt-2 text-xs text-muted-foreground sm:mt-3">
          This project has ended or is not supported.
        </p>
      ) : null}

      <AppButton
        className="mt-4 w-full rounded-full text-xs sm:mt-6 sm:text-sm"
        type="submit"
        disabled={!isProjectOpen || isWriting}
        glow="primary"
      >
        {isWriting ? 'Transaction Confirming...' : 'Support Now'}
      </AppButton>

      <p className="mt-2 text-center text-xs text-muted-foreground sm:mt-3">
        Your support will be used for project execution, and cannot be refunded.
      </p>
    </form>
  );
}
