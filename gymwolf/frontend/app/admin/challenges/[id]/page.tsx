'use client';

import { useParams } from 'next/navigation';
import ChallengeForm from '../ChallengeForm';

export default function EditChallengePage() {
  const params = useParams();
  const challengeId = params.id as string;
  
  return <ChallengeForm challengeId={challengeId} isNew={false} />;
}