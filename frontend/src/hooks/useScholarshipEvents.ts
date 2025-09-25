import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from './useContract';

export interface ScholarshipEvent {
  id: string;
  type: 'created' | 'claimed' | 'revoked';
  scholarshipId: number;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  data: {
    student?: string;
    amount?: string;
    name?: string;
    maxRecipients?: number;
    deadline?: number;
    admin?: string;
  };
}

export const useScholarshipEvents = () => {
  const { provider } = useWeb3();
  const { scholarshipContract } = useContract();
  const [events, setEvents] = useState<ScholarshipEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch historical events
  const fetchEvents = useCallback(async (fromBlock: number = 0) => {
    if (!scholarshipContract || !provider) return;

    try {
      setLoading(true);
      setError(null);

      const currentBlock = await provider.getBlockNumber();
      const toBlock = currentBlock;

      // Fetch ScholarshipCreated events
      const createdFilter = scholarshipContract.filters.ScholarshipCreated();
      const createdEvents = await scholarshipContract.queryFilter(createdFilter, fromBlock, toBlock);

      // Fetch ScholarshipClaimed events
      const claimedFilter = scholarshipContract.filters.ScholarshipClaimed();
      const claimedEvents = await scholarshipContract.queryFilter(claimedFilter, fromBlock, toBlock);

      // Fetch ScholarshipRevoked events
      const revokedFilter = scholarshipContract.filters.ScholarshipRevoked();
      const revokedEvents = await scholarshipContract.queryFilter(revokedFilter, fromBlock, toBlock);

      // Process all events
      const allEvents: ScholarshipEvent[] = [];

      // Process created events
      for (const event of createdEvents) {
        if (event.args) {
          allEvents.push({
            id: `created-${event.args.scholarshipId}-${event.blockNumber}`,
            type: 'created',
            scholarshipId: event.args.scholarshipId.toNumber(),
            timestamp: event.args.timestamp.toNumber(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            data: {
              name: event.args.name,
              amount: ethers.formatEther(event.args.totalAmount),
              maxRecipients: event.args.maxRecipients.toNumber(),
              deadline: event.args.deadline.toNumber(),
            },
          });
        }
      }

      // Process claimed events
      for (const event of claimedEvents) {
        if (event.args) {
          allEvents.push({
            id: `claimed-${event.args.scholarshipId}-${event.args.student}-${event.blockNumber}`,
            type: 'claimed',
            scholarshipId: event.args.scholarshipId.toNumber(),
            timestamp: event.args.timestamp.toNumber(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            data: {
              student: event.args.student,
              amount: ethers.formatEther(event.args.amount),
            },
          });
        }
      }

      // Process revoked events
      for (const event of revokedEvents) {
        if (event.args) {
          allEvents.push({
            id: `revoked-${event.args.scholarshipId}-${event.blockNumber}`,
            type: 'revoked',
            scholarshipId: event.args.scholarshipId.toNumber(),
            timestamp: event.args.timestamp.toNumber(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            data: {
              admin: event.args.admin,
            },
          });
        }
      }

      // Sort events by timestamp (newest first)
      allEvents.sort((a, b) => b.timestamp - a.timestamp);

      setEvents(allEvents);
    } catch (err) {
      console.error('Error fetching scholarship events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [scholarshipContract, provider]);

  // Get events for a specific scholarship
  const getScholarshipEvents = useCallback((scholarshipId: number) => {
    return events.filter(event => event.scholarshipId === scholarshipId);
  }, [events]);

  // Get events by type
  const getEventsByType = useCallback((type: ScholarshipEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  // Get recent events (last N events)
  const getRecentEvents = useCallback((count: number = 10) => {
    return events.slice(0, count);
  }, [events]);

  // Setup real-time event listeners
  useEffect(() => {
    if (!scholarshipContract) return;

    const handleScholarshipCreated = (
      scholarshipId: ethers.BigNumberish,
      name: string,
      totalAmount: ethers.BigNumberish,
      maxRecipients: ethers.BigNumberish,
      deadline: ethers.BigNumberish,
      timestamp: ethers.BigNumberish,
      event: ethers.Log
    ) => {
      const newEvent: ScholarshipEvent = {
        id: `created-${scholarshipId}-${event.blockNumber}`,
        type: 'created',
        scholarshipId: Number(scholarshipId),
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: {
          name,
          amount: ethers.formatEther(totalAmount),
          maxRecipients: Number(maxRecipients),
          deadline: Number(deadline),
        },
      };

      setEvents(prev => [newEvent, ...prev]);
    };

    const handleScholarshipClaimed = (
      scholarshipId: ethers.BigNumberish,
      student: string,
      amount: ethers.BigNumberish,
      timestamp: ethers.BigNumberish,
      event: ethers.Log
    ) => {
      const newEvent: ScholarshipEvent = {
        id: `claimed-${scholarshipId}-${student}-${event.blockNumber}`,
        type: 'claimed',
        scholarshipId: Number(scholarshipId),
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: {
          student,
          amount: ethers.formatEther(amount),
        },
      };

      setEvents(prev => [newEvent, ...prev]);
    };

    const handleScholarshipRevoked = (
      scholarshipId: ethers.BigNumberish,
      admin: string,
      timestamp: ethers.BigNumberish,
      event: ethers.Log
    ) => {
      const newEvent: ScholarshipEvent = {
        id: `revoked-${scholarshipId}-${event.blockNumber}`,
        type: 'revoked',
        scholarshipId: Number(scholarshipId),
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        data: {
          admin,
        },
      };

      setEvents(prev => [newEvent, ...prev]);
    };

    // Listen for events
    scholarshipContract.on('ScholarshipCreated', handleScholarshipCreated);
    scholarshipContract.on('ScholarshipClaimed', handleScholarshipClaimed);
    scholarshipContract.on('ScholarshipRevoked', handleScholarshipRevoked);

    return () => {
      scholarshipContract.off('ScholarshipCreated', handleScholarshipCreated);
      scholarshipContract.off('ScholarshipClaimed', handleScholarshipClaimed);
      scholarshipContract.off('ScholarshipRevoked', handleScholarshipRevoked);
    };
  }, [scholarshipContract]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    getScholarshipEvents,
    getEventsByType,
    getRecentEvents,
    refetch: fetchEvents,
  };
};
