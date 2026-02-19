'use client';

import { useEffect, useMemo, useState } from 'react';
import FeedCard from './FeedCard';
import { Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface FeedClientProps {
    prompts: Prompt[];
}

type InteractionState = Record<string, { vote: 1 | -1 | 0; bookmarked: boolean }>;

export default function FeedClient({ prompts }: FeedClientProps) {
    const { user } = useAuth();
    const [interactionState, setInteractionState] = useState<{
        uid: string;
        map: InteractionState;
    } | null>(null);

    const promptIds = useMemo(() => prompts.map((prompt) => prompt.id), [prompts]);
    const promptIdsKey = useMemo(() => promptIds.join(','), [promptIds]);

    useEffect(() => {
        if (!user || promptIds.length === 0) return;
        const uid = user.uid;

        const controller = new AbortController();

        async function loadInteractions() {
            try {
                const res = await fetch('/api/users/me/interactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ promptIds }),
                    signal: controller.signal,
                });

                if (!res.ok) return;

                const data = await res.json();
                const votes: Record<string, number> = data.votes || {};
                const bookmarked = new Set<string>(data.bookmarkedIds || []);
                const next: InteractionState = {};

                for (const id of promptIds) {
                    next[id] = { vote: (votes[id] as 1 | -1) || 0, bookmarked: bookmarked.has(id) };
                }

                setInteractionState({ uid, map: next });
            } catch {
                // Ignore request cancellation/network failures and keep optimistic defaults.
            }
        }

        void loadInteractions();

        return () => controller.abort();
    }, [promptIds, promptIdsKey, user]);

    const interactions = user && interactionState?.uid === user.uid ? interactionState.map : {};

    return (
        <>
            {prompts.map((prompt) => (
                <FeedCard
                    key={`${prompt.id}-${user?.uid || 'guest'}-${interactions[prompt.id]?.vote ?? 0}-${interactions[prompt.id]?.bookmarked ? '1' : '0'}`}
                    prompt={prompt}
                    initialVote={interactions[prompt.id]?.vote ?? 0}
                    initialBookmarked={Boolean(interactions[prompt.id]?.bookmarked)}
                />
            ))}
        </>
    );
}
