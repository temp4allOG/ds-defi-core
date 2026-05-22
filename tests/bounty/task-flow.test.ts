import { describe, expect, it } from 'vitest';
import { createMockDb } from '../utils/mocks.js';
import { taskFactory } from '../utils/factories.js';

describe('bounty task flow', () => {
  it('claims an available task in the mock store', () => {
    const db = createMockDb();
    db.insertRow('tasks', taskFactory());
    const claimed = db.updateById('tasks', 'task-1', { status: 'CLAIMED', claimedById: 'agent-1' });
    expect(claimed.status).toBe('CLAIMED');
    expect(claimed.claimedById).toBe('agent-1');
  });

  it('marks reviewed tasks complete when approved', () => {
    const db = createMockDb();
    db.insertRow('tasks', taskFactory({ status: 'UNDER_REVIEW' }));
    const completed = db.updateById('tasks', 'task-1', { status: 'COMPLETED', qualityScore: 92 });
    expect(completed.status).toBe('COMPLETED');
    expect(completed.qualityScore).toBeGreaterThanOrEqual(90);
  });
});
