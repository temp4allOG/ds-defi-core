import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export type AgentLevel = 'L0_CANDIDATE' | 'L1_WORKER' | 'L2_EMERGENT' | 'L3_SOVEREIGN';
export type ProofType = 'level' | 'capability' | 'reputation' | 'composite';

export interface AgentPrivateClaims {
  agentId: string;
  level: AgentLevel;
  capabilities: string[];
  reputationScore: number;
  secret?: string;
}

export interface ZkIdentity {
  zkId: string;
  commitment: string;
  salt: string;
}

export interface ZkProof {
  type: ProofType;
  commitment: string;
  proof: string;
  publicInputs: Record<string, unknown>;
  timestamp: Date;
}

const LEVEL_RANK: Record<AgentLevel, number> = {
  L0_CANDIDATE: 0,
  L1_WORKER: 1,
  L2_EMERGENT: 2,
  L3_SOVEREIGN: 3,
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function generateZkId(agentId: string, secret = randomBytes(32).toString('hex')): ZkIdentity {
  const salt = randomBytes(16).toString('hex');
  const commitment = sha256(`${agentId}:${secret}:${salt}`);
  return { zkId: `zk_${commitment.slice(0, 24)}`, commitment, salt };
}

export function createClaimCommitment(identity: ZkIdentity, claims: AgentPrivateClaims): string {
  const normalized = {
    level: claims.level,
    capabilities: [...claims.capabilities].sort(),
    reputationScore: claims.reputationScore,
    secret: claims.secret ?? '',
  };
  return sha256(`${identity.commitment}:${stableJson(normalized)}`);
}

function signProof(type: ProofType, commitment: string, publicInputs: Record<string, unknown>, claimCommitment: string): string {
  return sha256(`${type}:${commitment}:${stableJson(publicInputs)}:${claimCommitment}`);
}

export function proveLevel(identity: ZkIdentity, claims: AgentPrivateClaims, minLevel: AgentLevel): ZkProof {
  const rank = LEVEL_RANK[claims.level];
  const minRank = LEVEL_RANK[minLevel];
  if (rank < minRank) throw new Error('level threshold not satisfied');
  const publicInputs = { minLevel, minRank, satisfied: true };
  const claimCommitment = createClaimCommitment(identity, claims);
  return { type: 'level', commitment: identity.commitment, proof: signProof('level', identity.commitment, publicInputs, claimCommitment), publicInputs, timestamp: new Date() };
}

export function proveCapability(identity: ZkIdentity, claims: AgentPrivateClaims, capability: string): ZkProof {
  if (!claims.capabilities.includes(capability)) throw new Error('capability not satisfied');
  const publicInputs = { capability, satisfied: true };
  const claimCommitment = createClaimCommitment(identity, claims);
  return { type: 'capability', commitment: identity.commitment, proof: signProof('capability', identity.commitment, publicInputs, claimCommitment), publicInputs, timestamp: new Date() };
}

export function proveReputation(identity: ZkIdentity, claims: AgentPrivateClaims, minScore: number): ZkProof {
  if (claims.reputationScore < minScore) throw new Error('reputation threshold not satisfied');
  const publicInputs = { minScore, satisfied: true };
  const claimCommitment = createClaimCommitment(identity, claims);
  return { type: 'reputation', commitment: identity.commitment, proof: signProof('reputation', identity.commitment, publicInputs, claimCommitment), publicInputs, timestamp: new Date() };
}

export function verifyProof(proof: ZkProof, claimCommitment: string): boolean {
  const expected = signProof(proof.type, proof.commitment, proof.publicInputs, claimCommitment);
  return safeEqualHex(proof.proof, expected);
}

export function revealIdentity(identity: ZkIdentity, agentId: string, secret: string): boolean {
  const expected = sha256(`${agentId}:${secret}:${identity.salt}`);
  return safeEqualHex(identity.commitment, expected);
}
