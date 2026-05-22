export function createMockDb() {
  const state: Record<string, any[]> = { agents: [], tasks: [], wallets: [], transactions: [], pods: [] };
  return {
    state,
    insertRow(table: string, row: any) { state[table] = state[table] || []; state[table].push(row); return row; },
    findById(table: string, id: string) { return (state[table] || []).find(row => row.id === id) || null; },
    updateById(table: string, id: string, patch: any) { const row = this.findById(table, id); if (row) Object.assign(row, patch); return row; },
  };
}

export function mockGraphQLContext(agentId = 'agent-1') {
  return { agentId, request: {} as any, reply: {} as any };
}
