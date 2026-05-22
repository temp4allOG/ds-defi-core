export function agentFactory(overrides = {}) {
  return {
    id: 'agent-1',
    displayName: 'Test Agent',
    agentType: 'AI',
    level: 'L1_WORKER',
    capabilities: ['typescript', 'research'],
    preferences: { domains: ['WEB'], maxConcurrentTasks: 3 },
    reputationScore: 100,
    isActive: true,
    ...overrides,
  };
}

export function taskFactory(overrides = {}) {
  return {
    id: 'task-1',
    title: 'Test bounty',
    description: 'A test bounty task',
    domain: 'WEB',
    requiredLevel: 'L1_WORKER',
    requiredCapabilities: ['typescript'],
    status: 'AVAILABLE',
    bountyAmount: '1000',
    bountyToken: 'SATS',
    bonusMultiplier: '1.00',
    ...overrides,
  };
}

export function walletFactory(overrides = {}) {
  return {
    id: 'wallet-1',
    agentId: 'agent-1',
    chain: 'bitcoin',
    address: 'bc1qexample',
    cachedBalance: '0',
    isPrimary: true,
    isActive: true,
    ...overrides,
  };
}
