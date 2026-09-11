// Network, contract and method configuration for SLA Guard.
import { testnetBradbury } from "genlayer-js/chains"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// v4 deployment on Bradbury Testnet (claim eligibility + replay protection).
export const DEFAULT_CONTRACT_ADDRESS = "0xF05D822Bd4c2F18b8452ce6086f77070CAdfbE10"

export const CONTRACT_ADDRESS =
	import.meta.env.VITE_CONTRACT_ADDRESS ?? DEFAULT_CONTRACT_ADDRESS

export const RPC_ENDPOINT =
	import.meta.env.VITE_GENLAYER_RPC ?? "https://bradbury.genlayer.fastnode.io"

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? testnetBradbury.id)

export const CHAIN_ID_HEX = "0x" + CHAIN_ID.toString(16)

export const EXPLORER_URL = "https://explorer-bradbury.genlayer.com"

export const IS_CONTRACT_CONFIGURED =
	CONTRACT_ADDRESS.toLowerCase() !== ZERO_ADDRESS

// Official SDK chain config - keeps the client's decoder in sync with the
// protocol actually running on Bradbury. Override only the RPC URL if the
// user supplied a custom one via VITE_GENLAYER_RPC.
export const bradburyChain = {
	...testnetBradbury,
	rpcUrls: {
		default: { http: [RPC_ENDPOINT] },
		public: { http: [RPC_ENDPOINT] },
	},
}

export const metamaskChainParams = {
	chainId: CHAIN_ID_HEX,
	chainName: "GenLayer Bradbury Testnet",
	nativeCurrency: { name: "GenLayer Token", symbol: "GEN", decimals: 18 },
	rpcUrls: [RPC_ENDPOINT],
	blockExplorerUrls: [EXPLORER_URL],
}

export const READ = {
	stats: "get_stats",
	fundBalance: "get_fund_balance",
	compensation: "get_compensation_amount",
	premium: "get_premium_amount",
	totalPaidOut: "get_total_paid_out",
	owner: "get_owner",
	isPaused: "is_paused",
	claimsCount: "get_claims_count",
	claim: "get_claim",
	claimsHistory: "get_claims_history",
	monitoredServices: "get_monitored_services",
	services: "get_services",
	service: "get_service",
	subscriptions: "get_subscriptions",
	isEligible: "is_eligible",
} as const

export const WRITE = {
	depositFunds: "deposit_funds",
	withdrawFunds: "withdraw_funds",
	setCompensationAmount: "set_compensation_amount",
	setPremiumAmount: "set_premium_amount",
	setIncidentWindow: "set_incident_window",
	setClaimCooldown: "set_claim_cooldown",
	addMonitoredService: "add_monitored_service",
	removeMonitoredService: "remove_monitored_service",
	addBeneficiary: "add_beneficiary",
	removeBeneficiary: "remove_beneficiary",
	resolveIncident: "resolve_incident",
	subscribe: "subscribe",
	pause: "pause",
	unpause: "unpause",
	reportOutage: "report_outage",
} as const

export type ClaimStatus = "approved" | "rejected"

export type ClaimRecord = {
	id: number
	claimant: string
	service_id: number
	incident_id: string
	target_url: string
	status: ClaimStatus
	status_code: number
	payout: number
	reason: string
	at: number
}

export type OutageVerdict = {
	claim_id: number
	incident_id: string
	approved: boolean
	payout: number
	status_code: number
	reason: string
}

/** One owner-configured insured service, including its incident lifecycle. */
export type ServiceRecord = {
	id: number
	url: string
	active: boolean
	incident_seq: number
	incident_state: "none" | "compensated"
	incident_id: string
	incident_paid_at: number
	incident_payouts: number
	claims_total: number
	current_incident: string
}

/** A policy that makes one address an eligible payout recipient. */
export type PolicyRecord = {
	service_id: number
	subscriber: string
	active: boolean
	source: "premium" | "owner"
	since: number
	last_claim_at: number
	last_incident_id: string
	claims_made: number
	paid_total: number
}

/** Result of the gas-free is_eligible() pre-flight check. */
export type Eligibility = {
	eligible: boolean
	reason: string
	incident_id?: string
	cooldown_remaining?: number
}

export type Stats = {
	owner: string
	total_fund: number
	total_paid_out: number
	total_premiums: number
	compensation_amount: number
	premium_amount: number
	incident_window: number
	claim_cooldown: number
	claims_total: number
	claims_approved: number
	claims_rejected: number
	monitored: number
	active_policies: number
	compensated_incidents: number
	paused: boolean
}

// Endpoints used by the quick-test buttons on the Report Outage page.
export const TEST_ENDPOINTS = [
	{ url: "https://httpbin.org/status/500", label: "500 Internal Error", expect: "approved" },
	{ url: "https://httpbin.org/status/503", label: "503 Unavailable", expect: "approved" },
	{ url: "https://httpbin.org/status/502", label: "502 Bad Gateway", expect: "approved" },
	{ url: "https://httpbin.org/status/200", label: "200 Healthy", expect: "rejected" },
	{ url: "https://this-domain-does-not-exist-9f3a2b.io", label: "Unreachable host", expect: "approved" },
] as const