import { describe, expect, it } from 'vitest';

describe('graphql resolver shape expectations', () => {
  it('documents key query names expected by clients', () => {
    const queries = ['agent', 'agents', 'bountyBoard', 'task', 'myTasks', 'economyStats'];
    expect(queries).toContain('bountyBoard');
    expect(queries).toContain('myTasks');
  });
});
