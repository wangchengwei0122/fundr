'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import type { Address, PublicClient } from 'viem';
import { formatEther } from 'viem';
import { campaignAbi } from '@/lib/abi';

export type BackerRecord = {
  address: Address;
  amount: string; // ETH amount as string
  amountWei: bigint;
  timestamp: number;
  blockNumber: bigint;
  txHash: `0x${string}`;
};

async function fetchBackers(
  campaignAddress: Address,
  publicClient: PublicClient
): Promise<BackerRecord[]> {
  if (!publicClient) {
    return [];
  }

  try {
    // Find Pledged event definition from ABI
    const pledgedEvent = campaignAbi.find(
      // (item) => item.type === 'event' && item.name === 'Pledged'
      (item): item is Extract<(typeof campaignAbi)[number], { type: 'event'; name: 'Pledged' }> =>
        item.type === 'event' && item.name === 'Pledged'
    );

    if (!pledgedEvent) return [];

    // Get current block number to determine query range
    let currentBlock: bigint;
    try {
      currentBlock = await publicClient.getBlockNumber();
    } catch {
      console.warn('Failed to get current block number');
      return [];
    }

    // Use reasonable block range: last 50000 blocks (about 7 days, assuming 12 seconds per block)
    // This avoids issues where some RPC nodes don't support 'earliest' or large range queries
    const maxBlocksToSearch = 50000n;
    const fromBlock = currentBlock > maxBlocksToSearch ? currentBlock - maxBlocksToSearch : 0n;

    // Get Pledged event logs
    let logs;
    try {
      logs = await publicClient.getLogs({
        address: campaignAddress,
        event: pledgedEvent,
        fromBlock,
        toBlock: currentBlock,
      });
    } catch (error) {
      // If query fails, try smaller range (last 10000 blocks)
      console.warn('Failed to get logs with large range, trying smaller range', error);
      try {
        const smallerRange = 10000n;
        const smallerFromBlock = currentBlock > smallerRange ? currentBlock - smallerRange : 0n;
        logs = await publicClient.getLogs({
          address: campaignAddress,
          event: pledgedEvent,
          fromBlock: smallerFromBlock,
          toBlock: currentBlock,
        });
      } catch (error2) {
        // If still fails, only query last 1000 blocks
        console.warn('Failed to get logs with medium range, trying very recent blocks', error2);
        const veryRecentRange = 1000n;
        const veryRecentFromBlock =
          currentBlock > veryRecentRange ? currentBlock - veryRecentRange : 0n;
        logs = await publicClient.getLogs({
          address: campaignAddress,
          event: pledgedEvent,
          fromBlock: veryRecentFromBlock,
          toBlock: currentBlock,
        });
      }
    }

    type PledgedLog = {
      blockNumber: bigint | null;
      transactionHash: `0x${string}` | null;
      args: { backer: Address; amount: bigint };
    };
    const typedLogs = logs as PledgedLog[];

    // Get corresponding block information to get timestamp
    const backersWithMaybeNull = await Promise.all(
      typedLogs.map(async (log) => {
        // viem's Log type may have null blockNumber/transactionHash in pending cases
        if (log.blockNumber == null || log.transactionHash == null) {
          return null;
        }

        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        // const amountWei = log.args.amount as bigint;
        const { backer, amount } = log.args as { backer: Address; amount: bigint };
        const amountWei = amount;

        return {
          // address: log.args.backer as Address,
          address: backer,

          amount: formatEther(amountWei),
          amountWei,
          timestamp: Number(block.timestamp),
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
        } as BackerRecord;
      })
    );

    const backersWithDetails = backersWithMaybeNull.filter(
      (item): item is BackerRecord => item !== null
    );

    // Sort by time descending (newest first)
    return backersWithDetails.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to fetch backers', error);
    return [];
  }
}

export function useBackers(campaignAddress: Address | undefined) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['backers', campaignAddress],
    queryFn: () => {
      if (!campaignAddress || !publicClient) {
        return [];
      }
      return fetchBackers(campaignAddress, publicClient);
    },
    enabled: Boolean(campaignAddress && publicClient),
    staleTime: 30000, // Don't refetch within 30 seconds
  });
}
