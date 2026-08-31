import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";

export function usePendingSyncCounts() {
  const pendingResponses = useLiveQuery(() => db.pendingResponses.count(), [], 0);
  const pendingEvidence = useLiveQuery(() => db.pendingEvidence.count(), [], 0);
  return { pendingResponses, pendingEvidence, total: pendingResponses + pendingEvidence };
}
