import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	CONTRACT_ADDRESS,
	IS_CONTRACT_CONFIGURED,
	READ,
	WRITE,
	type ClaimRecord,
	type Eligibility,
	type OutageVerdict,
	type PolicyRecord,
	type ServiceRecord,
	type Stats,
} from "../config/genlayer"
import {
	describeError,
	readMethod,
	receiptReturnValue,
	waitForFinalized,
	writeMethod,
} from "../lib/contract"
import { sameAddress } from "../lib/format"

const HISTORY_LIMIT = 200
const POLL_INTERVAL = 15000

function toNumber(value: unknown): number {
	if (typeof value === "number") return value
	if (typeof value === "bigint") return Number(value)
	const parsed = Number(String(value ?? 0))
	return Number.isFinite(parsed) ? parsed : 0
}

function toBoolean(value: unknown): boolean {
	return value === true || String(value).toLowerCase() === "true"
}

function parseJsonObject(raw: unknown): Record<string, unknown> | null {
	if (raw && typeof raw === "object") return raw as Record<string, unknown>
	if (typeof raw !== "string") return null
	try {
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null
	} catch {
		return null
	}
}

function parseClaim(raw: unknown): ClaimRecord | null {
	const data = parseJsonObject(raw)
	if (!data) return null
	const status = String(data.status ?? "rejected") === "approved" ? "approved" : "rejected"
	return {
		id: toNumber(data.id),
		claimant: String(data.claimant ?? ""),
		service_id: toNumber(data.service_id),
		incident_id: String(data.incident_id ?? ""),
		target_url: String(data.target_url ?? ""),
		status,
		status_code: toNumber(data.status_code),
		payout: toNumber(data.payout),
		reason: String(data.reason ?? ""),
		at: toNumber(data.at),
	}
}

function parseService(raw: unknown): ServiceRecord | null {
	const data = parseJsonObject(raw)
	if (!data) return null
	const state = String(data.incident_state ?? "none") === "compensated" ? "compensated" : "none"
	const seq = toNumber(data.incident_seq)
	const id = toNumber(data.id)
	return {
		id,
		url: String(data.url ?? ""),
		active: toBoolean(data.active),
		incident_seq: seq,
		incident_state: state,
		incident_id: String(data.incident_id ?? ""),
		incident_paid_at: toNumber(data.incident_paid_at),
		incident_payouts: toNumber(data.incident_payouts),
		claims_total: toNumber(data.claims_total),
		current_incident: String(data.current_incident ?? id + ":" + seq),
	}
}

function parsePolicy(raw: unknown): PolicyRecord | null {
	const data = parseJsonObject(raw)
	if (!data) return null
	return {
		service_id: toNumber(data.service_id),
		subscriber: String(data.subscriber ?? "").toLowerCase(),
		active: toBoolean(data.active),
		source: String(data.source ?? "owner") === "premium" ? "premium" : "owner",
		since: toNumber(data.since),
		last_claim_at: toNumber(data.last_claim_at),
		last_incident_id: String(data.last_incident_id ?? ""),
		claims_made: toNumber(data.claims_made),
		paid_total: toNumber(data.paid_total),
	}
}

function parseVerdict(raw: unknown): OutageVerdict | null {
	const data = parseJsonObject(raw)
	if (!data) return null
	return {
		claim_id: toNumber(data.claim_id),
		incident_id: String(data.incident_id ?? ""),
		approved: toBoolean(data.approved),
		payout: toNumber(data.payout),
		status_code: toNumber(data.status_code),
		reason: String(data.reason ?? ""),
	}
}

function parseEligibility(raw: unknown): Eligibility | null {
	const data = parseJsonObject(raw)
	if (!data) return null
	return {
		eligible: toBoolean(data.eligible),
		reason: String(data.reason ?? ""),
		incident_id: data.incident_id === undefined ? undefined : String(data.incident_id),
		cooldown_remaining:
			data.cooldown_remaining === undefined ? undefined : toNumber(data.cooldown_remaining),
	}
}

function buildStats(
	raw: unknown,
	claims: ClaimRecord[],
	services: ServiceRecord[],
	policies: PolicyRecord[],
): Stats {
	const data = parseJsonObject(raw) ?? {}
	return {
		owner: String(data.owner ?? ""),
		total_fund: toNumber(data.total_fund),
		total_paid_out: toNumber(data.total_paid_out),
		total_premiums: toNumber(data.total_premiums),
		compensation_amount: toNumber(data.compensation_amount),
		premium_amount: toNumber(data.premium_amount),
		incident_window: toNumber(data.incident_window),
		claim_cooldown: toNumber(data.claim_cooldown),
		claims_total: data.claims_total !== undefined ? toNumber(data.claims_total) : claims.length,
		claims_approved: claims.filter((claim) => claim.status === "approved").length,
		claims_rejected: claims.filter((claim) => claim.status === "rejected").length,
		monitored:
			data.monitored !== undefined
				? toNumber(data.monitored)
				: services.filter((service) => service.active).length,
		active_policies:
			data.active_policies !== undefined
				? toNumber(data.active_policies)
				: policies.filter((policy) => policy.active).length,
		compensated_incidents:
			data.compensated_incidents !== undefined
				? toNumber(data.compensated_incidents)
				: services.filter((service) => service.incident_state === "compensated").length,
		paused: toBoolean(data.paused),
	}
}

export type ReportStage = 0 | 1 | 2 | 3 | 4

export type SlaGuardState = {
	stats: Stats | null
	claims: ClaimRecord[]
	services: ServiceRecord[]
	activeServices: ServiceRecord[]
	policies: PolicyRecord[]
	myPolicies: PolicyRecord[]
	isLoading: boolean
	isRefreshing: boolean
	error: string | null
	lastUpdated: number | null
	isOwner: boolean
	isConfigured: boolean
	contractAddress: string
	refresh: (options?: { silent?: boolean }) => Promise<void>
	serviceByUrl: (url: string) => ServiceRecord | null
	policyForUrl: (url: string) => PolicyRecord | null
	checkEligibility: (url: string, address?: string) => Promise<Eligibility | null>
	depositFunds: (valueWei: bigint) => Promise<string>
	withdrawFunds: (amountWei: bigint) => Promise<string>
	setCompensationAmount: (amountWei: bigint) => Promise<string>
	setPremiumAmount: (amountWei: bigint) => Promise<string>
	setIncidentWindow: (seconds: number) => Promise<string>
	setClaimCooldown: (seconds: number) => Promise<string>
	addService: (url: string) => Promise<string>
	removeService: (url: string) => Promise<string>
	subscribe: (url: string, premiumWei: bigint) => Promise<string>
	addBeneficiary: (url: string, address: string) => Promise<string>
	removeBeneficiary: (url: string, address: string) => Promise<string>
	resolveIncident: (url: string) => Promise<string>
	pause: () => Promise<string>
	unpause: () => Promise<string>
	reportOutage: (
		url: string,
		onStage?: (stage: ReportStage) => void,
	) => Promise<OutageVerdict | null>
}

export function useSlaGuard(account: string | null): SlaGuardState {
	const [stats, setStats] = useState<Stats | null>(null)
	const [claims, setClaims] = useState<ClaimRecord[]>([])
	const [services, setServices] = useState<ServiceRecord[]>([])
	const [policies, setPolicies] = useState<PolicyRecord[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [lastUpdated, setLastUpdated] = useState<number | null>(null)
	const mounted = useRef(true)

	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
		}
	}, [])

	const refresh = useCallback(async (options?: { silent?: boolean }) => {
		if (!IS_CONTRACT_CONFIGURED) {
			setIsLoading(false)
			setError("Contract address is not configured. Set VITE_CONTRACT_ADDRESS and rebuild.")
			return
		}
		if (options?.silent) setIsRefreshing(true)
		try {
			const [rawStats, rawHistory, rawServices, rawPolicies] = await Promise.all([
				readMethod<unknown>(READ.stats),
				readMethod<unknown[]>(READ.claimsHistory, [HISTORY_LIMIT]),
				readMethod<unknown[]>(READ.services),
				readMethod<unknown[]>(READ.subscriptions),
			])
			if (!mounted.current) return

			const parsedClaims = (Array.isArray(rawHistory) ? rawHistory : [])
				.map(parseClaim)
				.filter((claim): claim is ClaimRecord => claim !== null)
			const parsedServices = (Array.isArray(rawServices) ? rawServices : [])
				.map(parseService)
				.filter((service): service is ServiceRecord => service !== null)
			const parsedPolicies = (Array.isArray(rawPolicies) ? rawPolicies : [])
				.map(parsePolicy)
				.filter((policy): policy is PolicyRecord => policy !== null)

			setClaims(parsedClaims)
			setServices(parsedServices)
			setPolicies(parsedPolicies)
			setStats(buildStats(rawStats, parsedClaims, parsedServices, parsedPolicies))
			setError(null)
			setLastUpdated(Date.now())
		} catch (caught) {
			if (mounted.current) setError(describeError(caught))
		} finally {
			if (mounted.current) {
				setIsLoading(false)
				setIsRefreshing(false)
			}
		}
	}, [])

	useEffect(() => {
		refresh()
		const timer = window.setInterval(() => refresh({ silent: true }), POLL_INTERVAL)
		return () => window.clearInterval(timer)
	}, [refresh])

	const activeServices = useMemo(
		() => services.filter((service) => service.active),
		[services],
	)

	const myPolicies = useMemo(
		() =>
			account
				? policies.filter((policy) => sameAddress(policy.subscriber, account) && policy.active)
				: [],
		[account, policies],
	)

	const serviceByUrl = useCallback(
		(url: string): ServiceRecord | null => {
			const target = url.trim().toLowerCase()
			return services.find((service) => service.url.toLowerCase() === target) ?? null
		},
		[services],
	)

	const policyForUrl = useCallback(
		(url: string): PolicyRecord | null => {
			const service = serviceByUrl(url)
			if (!service || !account) return null
			return (
				policies.find(
					(policy) =>
						policy.service_id === service.id && sameAddress(policy.subscriber, account),
				) ?? null
			)
		},
		[account, policies, serviceByUrl],
	)

	const checkEligibility = useCallback(
		async (url: string, address?: string): Promise<Eligibility | null> => {
			const who = address ?? account
			if (!who || url.trim() === "") return null
			try {
				return parseEligibility(await readMethod<unknown>(READ.isEligible, [url.trim(), who]))
			} catch {
				return null
			}
		},
		[account],
	)

	const requireAccount = useCallback((): string => {
		if (!account) throw new Error("Connect your wallet first")
		return account
	}, [account])

	const send = useCallback(
		async (functionName: string, args: Array<string | number | boolean> = [], value?: bigint) => {
			const from = requireAccount()
			const hash = await writeMethod({ account: from, functionName, args, value })
			await waitForFinalized(hash)
			await refresh({ silent: true })
			return hash
		},
		[refresh, requireAccount],
	)

	const depositFunds = useCallback(
		(valueWei: bigint) => send(WRITE.depositFunds, [], valueWei),
		[send],
	)

	const withdrawFunds = useCallback(
		(amountWei: bigint) => send(WRITE.withdrawFunds, [amountWei.toString()]),
		[send],
	)

	const setCompensationAmount = useCallback(
		(amountWei: bigint) => send(WRITE.setCompensationAmount, [amountWei.toString()]),
		[send],
	)

	const setPremiumAmount = useCallback(
		(amountWei: bigint) => send(WRITE.setPremiumAmount, [amountWei.toString()]),
		[send],
	)

	const setIncidentWindow = useCallback(
		(seconds: number) => send(WRITE.setIncidentWindow, [Math.max(0, Math.floor(seconds))]),
		[send],
	)

	const setClaimCooldown = useCallback(
		(seconds: number) => send(WRITE.setClaimCooldown, [Math.max(0, Math.floor(seconds))]),
		[send],
	)

	const addService = useCallback(
		(url: string) => send(WRITE.addMonitoredService, [url.trim()]),
		[send],
	)

	const removeService = useCallback(
		(url: string) => send(WRITE.removeMonitoredService, [url.trim()]),
		[send],
	)

	const subscribe = useCallback(
		(url: string, premiumWei: bigint) => send(WRITE.subscribe, [url.trim()], premiumWei),
		[send],
	)

	const addBeneficiary = useCallback(
		(url: string, address: string) => send(WRITE.addBeneficiary, [url.trim(), address.trim()]),
		[send],
	)

	const removeBeneficiary = useCallback(
		(url: string, address: string) => send(WRITE.removeBeneficiary, [url.trim(), address.trim()]),
		[send],
	)

	const resolveIncident = useCallback(
		(url: string) => send(WRITE.resolveIncident, [url.trim()]),
		[send],
	)

	const pause = useCallback(() => send(WRITE.pause), [send])
	const unpause = useCallback(() => send(WRITE.unpause), [send])

	const reportOutage = useCallback(
		async (url: string, onStage?: (stage: ReportStage) => void) => {
			const from = requireAccount()
			onStage?.(1)
			const hash = await writeMethod({
				account: from,
				functionName: WRITE.reportOutage,
				args: [url.trim()],
			})
			onStage?.(2)
			const receipt = await waitForFinalized(hash)
			onStage?.(3)

			let verdict = parseVerdict(receiptReturnValue(receipt))
			await refresh({ silent: true })

			// Some RPC responses omit the return value: fall back to the stored claim.
			if (!verdict) {
				try {
					const count = toNumber(await readMethod<unknown>(READ.claimsCount))
					if (count > 0) {
						const claim = parseClaim(await readMethod<unknown>(READ.claim, [count - 1]))
						if (claim) {
							verdict = {
								claim_id: claim.id,
								incident_id: claim.incident_id,
								approved: claim.status === "approved",
								payout: claim.payout,
								status_code: claim.status_code,
								reason: claim.reason,
							}
						}
					}
				} catch {
					/* keep verdict null */
				}
			}

			onStage?.(4)
			return verdict
		},
		[refresh, requireAccount],
	)

	return {
		stats,
		claims,
		services,
		activeServices,
		policies,
		myPolicies,
		isLoading,
		isRefreshing,
		error,
		lastUpdated,
		isOwner: sameAddress(account ?? undefined, stats?.owner),
		isConfigured: IS_CONTRACT_CONFIGURED,
		contractAddress: CONTRACT_ADDRESS,
		refresh,
		serviceByUrl,
		policyForUrl,
		checkEligibility,
		depositFunds,
		withdrawFunds,
		setCompensationAmount,
		setPremiumAmount,
		setIncidentWindow,
		setClaimCooldown,
		addService,
		removeService,
		subscribe,
		addBeneficiary,
		removeBeneficiary,
		resolveIncident,
		pause,
		unpause,
		reportOutage,
	}
}
