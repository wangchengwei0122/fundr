'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address, Hash } from 'viem';
import { parseEther, decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { AppButton, AppInput } from '@/components/app';
import { PageShell } from '@/components/blocks/layout/page-shell';
import { Section } from '@/components/blocks/layout/section';
import { StepIndicator } from '@/components/blocks/form/step-indicator';
import { FormSection } from '@/components/blocks/form/form-section';
import { SummaryReview } from '@/components/blocks/form/summary-review';
import { campaignFactoryAbi } from '@/lib/abi';
import { CREATE_STEPS, PROJECT_CATEGORIES } from '@/lib/constants';

const controlClass =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20';

function resolveFactory(): Address {
  const envAddress = process.env.NEXT_PUBLIC_FACTORY;
  if (!envAddress || !/^0x[a-fA-F0-9]{40}$/.test(envAddress)) {
    throw new Error('NEXT_PUBLIC_FACTORY is not configured or invalid.');
  }
  return envAddress as Address;
}

type FormData = {
  title: string;
  tagline: string;
  description: string;
  goal: string;
  deadline: string;
  category: string;
  cover: string;
  milestone: string;
};

const initialFormData: FormData = {
  title: '',
  tagline: '',
  description: '',
  goal: '',
  deadline: '',
  category: PROJECT_CATEGORIES[0],
  cover: '',
  milestone: '',
};

export default function CreatePage() {
  const factoryAddress = useMemo(resolveFactory, []);
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  const [createdCampaignAddress, setCreatedCampaignAddress] = useState<Address | null>(null);

  const { writeContractAsync, isPending: isWriting, error: writeError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  useEffect(() => {
    if (isSuccess && receipt && publicClient) {
      try {
        const campaignCreatedEvent = campaignFactoryAbi.find(
          (item) => item.type === 'event' && item.name === 'CampaignCreated'
        );

        if (campaignCreatedEvent && receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: campaignFactoryAbi,
                eventName: 'CampaignCreated',
                data: log.data,
                topics: log.topics,
              });
              if (decoded && decoded.args && 'campaign' in decoded.args) {
                setCreatedCampaignAddress(decoded.args.campaign as Address);
                break;
              }
            } catch {
              // Continue to next log
            }
          }
        }
      } catch (error) {
        console.error('Failed to parse CampaignCreated event', error);
      }
    }
  }, [isSuccess, receipt, publicClient]);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
    },
    []
  );

  const validateStep = useCallback((step: number, data: FormData): string | null => {
    if (step === 0) {
      if (!data.title.trim()) return 'Please enter a project title.';
      if (!data.tagline.trim()) return 'Please enter a tagline.';
      if (!data.description.trim()) return 'Please enter a description.';
    }
    if (step === 1) {
      if (!data.goal.trim() || Number(data.goal) <= 0) return 'Please enter a valid goal amount.';
      if (!data.deadline.trim()) return 'Please select a deadline.';
      const deadline = Math.floor(new Date(`${data.deadline}T00:00:00Z`).getTime() / 1000);
      if (!Number.isFinite(deadline) || deadline <= Math.floor(Date.now() / 1000)) {
        return 'The deadline must be later than the current time.';
      }
    }
    return null;
  }, []);

  const handleNext = useCallback(() => {
    const error = validateStep(currentStep, formData);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setCurrentStep((s) => Math.min(CREATE_STEPS.length - 1, s + 1));
  }, [currentStep, formData, validateStep]);

  const handleBack = useCallback(() => {
    setFormError(null);
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);
      setTxHash(null);

      // Validate all steps
      for (let i = 0; i <= currentStep; i++) {
        const error = validateStep(i, formData);
        if (error) {
          setFormError(error);
          return;
        }
      }

      const deadline = Math.floor(new Date(`${formData.deadline}T00:00:00Z`).getTime() / 1000);
      let goal: bigint;
      try {
        goal = parseEther(formData.goal);
      } catch {
        setFormError('Please enter a valid goal amount (ETH).');
        return;
      }

      const milestones =
        formData.milestone
          ?.split('\n')
          .map((item) => item.trim())
          .filter((item): item is string => item.length > 0) ?? [];

      try {
        const metadataPayload = {
          version: '1.0.0',
          title: formData.title,
          summary: formData.tagline,
          tagline: formData.tagline,
          description: formData.description,
          category: formData.category,
          ...(formData.cover ? { image: formData.cover, cover: formData.cover } : {}),
          ...(milestones.length > 0 ? { milestones } : {}),
          funding: {
            goalAmountEth: formData.goal,
            goalAmountWei: goal.toString(),
            currency: 'ETH',
          },
          timeline: {
            deadline,
            deadlineISO: new Date(deadline * 1000).toISOString(),
          },
          createdAt: new Date().toISOString(),
        };

        const metadataFile = new File([JSON.stringify(metadataPayload, null, 2)], 'metadata.json', {
          type: 'application/json',
        });
        const uploadBody = new FormData();
        uploadBody.append('file', metadataFile);

        setIsUploadingMetadata(true);
        const response = await fetch('/api/metadata', {
          method: 'POST',
          body: uploadBody,
        });
        if (!response.ok) {
          throw new Error('Failed to upload project metadata. Please try again.');
        }
        const payload = (await response.json()) as { uri?: string; gatewayUrl?: string };
        const metadataURI = payload?.uri ?? payload?.gatewayUrl;
        if (!metadataURI) {
          throw new Error('Metadata upload did not return a valid URI.');
        }

        const hash = await writeContractAsync({
          address: factoryAddress,
          abi: campaignFactoryAbi,
          functionName: 'createCampaign',
          args: [goal, BigInt(deadline), metadataURI],
        });
        setTxHash(hash);
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        } else {
          setFormError('Transaction submission failed, please try again later.');
        }
      } finally {
        setIsUploadingMetadata(false);
      }
    },
    [currentStep, formData, factoryAddress, writeContractAsync, validateStep]
  );

  const submitDisabled = !isConnected || isUploadingMetadata || isWriting || isConfirming;
  const submitLabel = isUploadingMetadata
    ? 'Uploading metadata...'
    : isWriting || isConfirming
      ? 'Creating on blockchain...'
      : 'Create Campaign';

  // Success state
  if (isSuccess) {
    return (
      <PageShell maxWidth="lg">
        <Section
          title="Campaign Created!"
          description="Your crowdfunding campaign is now live on the blockchain"
        >
          <div className="rounded-[28px] border-2 border-success bg-success/10 p-6 sm:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                  {createdCampaignAddress ? 'Project Created Successfully!' : 'Transaction Confirmed!'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {createdCampaignAddress
                    ? 'Your campaign has been created and is now live on-chain.'
                    : 'Your transaction has been confirmed. The campaign should appear shortly.'}
                </p>
              </div>

              {txHash && (
                <div className="rounded-xl bg-card p-4 text-sm ring-1 ring-border">
                  <p className="font-medium text-foreground">Transaction Details</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{txHash}</p>
                  {receipt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Block: {Number(receipt.blockNumber)} | Gas: {receipt.gasUsed?.toString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {createdCampaignAddress && (
                  <AppButton
                    asChild
                    className="rounded-full bg-success px-8 text-success-foreground hover:bg-success/90"
                  >
                    <Link href={`/projects/${createdCampaignAddress}`}>View Campaign</Link>
                  </AppButton>
                )}
                <AppButton asChild variant="outline" className="rounded-full px-8">
                  <Link href="/">Back to Home</Link>
                </AppButton>
              </div>
            </div>
          </div>
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="lg">
      <Section
        title="Create Campaign"
        description="Launch your on-chain crowdfunding campaign in minutes"
      >
        {/* Step Indicator */}
        <StepIndicator
          steps={CREATE_STEPS}
          currentStep={currentStep}
          onStepClick={(index) => index < currentStep && setCurrentStep(index)}
        />

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <FormSection
              title="Project Basics"
              description="Tell backers what your project is about"
            >
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="title">
                    Project Title <span className="text-destructive">*</span>
                  </label>
                  <AppInput
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Next-generation Sustainable Energy Battery"
                    className="h-11 rounded-xl px-4"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="tagline">
                    Tagline <span className="text-destructive">*</span>
                  </label>
                  <AppInput
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Tell everyone about your project highlights in one sentence"
                    className="h-11 rounded-xl px-4"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={5}
                    placeholder="Expand on project background, vision, and core plans..."
                    className={`${controlClass} resize-none`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className={controlClass}
                    >
                      {PROJECT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="cover">
                      Cover Image URL
                    </label>
                    <AppInput
                      id="cover"
                      value={formData.cover}
                      onChange={(e) => updateField('cover', e.target.value)}
                      placeholder="https://..."
                      className="h-11 rounded-xl px-4"
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          )}

          {/* Step 2: Funding */}
          {currentStep === 1 && (
            <FormSection
              title="Funding Goal"
              description="Set your target amount and timeline"
              onChainHint="Goal amount and deadline will be stored on-chain and cannot be modified after creation"
            >
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="goal">
                      Goal Amount (ETH) <span className="text-destructive">*</span>
                    </label>
                    <AppInput
                      id="goal"
                      type="number"
                      step="any"
                      value={formData.goal}
                      onChange={(e) => updateField('goal', e.target.value)}
                      placeholder="10"
                      className="h-11 rounded-xl px-4"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="deadline">
                      Deadline <span className="text-destructive">*</span>
                    </label>
                    <AppInput
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => updateField('deadline', e.target.value)}
                      className="h-11 rounded-xl px-4"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="milestone">
                    Key Milestones (optional)
                  </label>
                  <textarea
                    id="milestone"
                    value={formData.milestone}
                    onChange={(e) => updateField('milestone', e.target.value)}
                    rows={3}
                    placeholder="List the phased tasks or achievements needed to reach the goal..."
                    className={`${controlClass} resize-none`}
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <SummaryReview
              title="Review Your Campaign"
              items={[
                { label: 'Project Title', value: formData.title },
                { label: 'Category', value: formData.category },
                { label: 'Funding Goal', value: `${formData.goal} ETH`, highlight: true },
                { label: 'Deadline', value: formData.deadline },
                ...(formData.cover ? [{ label: 'Cover Image', value: 'Provided' }] : []),
              ]}
              transactionNote="This will create a new Campaign smart contract. You will need to confirm the transaction in your wallet."
            />
          )}

          {/* Error Messages */}
          {formError && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {formError}
            </div>
          )}
          {writeError && !formError && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {writeError.message}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <AppButton
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-full px-6"
            >
              Back
            </AppButton>

            {currentStep < CREATE_STEPS.length - 1 ? (
              <AppButton
                type="button"
                onClick={handleNext}
                className="rounded-full px-6"
              >
                Continue
              </AppButton>
            ) : (
              <AppButton
                type="submit"
                disabled={submitDisabled}
                className="rounded-full px-6"
              >
                {submitLabel}
              </AppButton>
            )}
          </div>

          {/* Connection hint */}
          {!isConnected && currentStep === CREATE_STEPS.length - 1 && (
            <p className="text-center text-xs text-muted-foreground">
              Please connect your wallet to create a campaign
            </p>
          )}

          {/* Uploading indicator */}
          {isUploadingMetadata && (
            <p className="text-center text-xs text-muted-foreground">
              Uploading metadata to IPFS...
            </p>
          )}
        </form>
      </Section>
    </PageShell>
  );
}
