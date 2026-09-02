export type SessionStateName = "waiting" | "paired" | "ended";

export type PublicStatus = {
  sessionId: string;
  state: "waiting" | "paired" | "expired";
  expiresAt: number;
  browserConnected: boolean;
  agentConnected: boolean;
};

export type MintResponse = {
  sessionId: string;
  browserToken: string;
  agentToken: string;
  expiresAt: number;
  ttlSeconds: number;
  joins: {
    browser: string;
    agent: string;
  };
};

export const DEFAULT_TTL_SECONDS = 900;
export const MIN_TTL_SECONDS = 1;
export const MAX_TTL_SECONDS = 3600;
