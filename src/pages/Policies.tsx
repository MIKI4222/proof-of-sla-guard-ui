import { BadgeCheck, KeyRound, ShieldPlus, UserMinus, UserPlus } from "lucide-react"
import { useState } from "react"
import { Badge } from "../components/ui/Badge"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Skeleton } from "../components/ui/Skeleton"
import { useToast } from "../components/ui/Toast"
import { AddressChip } from "../components/ui/AddressChip"
import { useApp } from "../lib/appContext"
import { describeError } from "../lib/contract"
import { formatGen, hostOf } from "../lib/format"

export function Policies() {
	const { wallet, sla } = useApp()
	const toast = useToast()

	const [busyUrl, setBusyUrl] = useState<string | null>(null)
	const [grantUrl, setGrantUrl] = useState("")
	const [grantAddress, setGrantAddress] = useState("")
	const [grantBusy, setGrantBusy] = useState(false)

	const premium = BigInt(sla.stats?.premium_amount ?? 0)

	const subscribe = async (url: string) => {
		setBusyUrl(url)
		try {
			await sla.subscribe(url, premium)
			toast.success("Policy active", "You can now claim outages of " + hostOf(url))
		} catch (caught) {
			toast.error("Could not buy the policy", describeError(caught))
		} finally {
			setBusyUrl(null)
		}
	}

	const grant = async (revoke: boolean) => {
		setGrantBusy(true)
		try {
			if (revoke) {
				await sla.removeBeneficiary(grantUrl, grantAddress)
				toast.info("Policy revoked", "That address can no longer claim this service")
			} else {
				await sla.addBeneficiary(grantUrl, grantAddress)
				toast.success("Policy granted", "That address is now an eligible payout recipient")
			}
			setGrantAddress("")
		} catch (caught) {
			toast.error("Action failed", describeError(caught))
		} finally {
			setGrantBusy(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Policies"
				description="Only an address covered by an active policy can be paid for an outage. Buy coverage with a premium, or receive it from the provider."
				actions={
					<Badge tone="info">Premium {formatGen(sla.stats?.premium_amount ?? 0)}</Badge>
				}
			/>

			<div className="card mb-4 border-neon-violet/20">
				<div className="flex items-start gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neon-violet/20 bg-neon-violet/10 text-neon-violet">
						<KeyRound size={16} />
					</span>
					<div>
						<p className="text-sm font-medium text-slate-100">Why coverage is required</p>
						<p className="hint mt-1">
							The contract checks the policy before validators ever touch the endpoint, so an
							uncovered address cannot turn a real outage into a payout.
						</p>
					</div>
				</div>
			</div>

			{sla.isLoading ? (
				<div className="space-y-2">
					{[0, 1].map((row) => (
						<Skeleton key={row} className="h-24 w-full" />
					))}
				</div>
			) : sla.activeServices.length === 0 ? (
				<EmptyState
					icon={<ShieldPlus size={20} />}
					title="No insured services yet"
					description="The provider has not registered any endpoint, so there is nothing to insure against."
				/>
			) : (
				<div className="grid gap-3 lg:grid-cols-2">
					{sla.activeServices.map((service) => {
						const policy = sla.policyForUrl(service.url)
						const covered = Boolean(policy?.active)
						return (
							<div key={service.id} className="card card-hover">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-slate-100">
											{hostOf(service.url)}
										</p>
										<p className="mono mt-0.5 truncate text-slate-500">{service.url}</p>
									</div>
									<Badge tone={covered ? "good" : "muted"}>
										{covered ? "covered" : "not covered"}
									</Badge>
								</div>

								<dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
									<div>
										<dt className="text-slate-500">Current incident</dt>
										<dd className="mono mt-0.5 text-slate-300">{service.current_incident}</dd>
									</div>
									<div>
										<dt className="text-slate-500">Claims paid</dt>
										<dd className="mono mt-0.5 text-slate-300">{service.incident_payouts}</dd>
									</div>
									{policy ? (
										<>
											<div>
												<dt className="text-slate-500">Your claims</dt>
												<dd className="mono mt-0.5 text-slate-300">{policy.claims_made}</dd>
											</div>
											<div>
												<dt className="text-slate-500">Received</dt>
												<dd className="mono mt-0.5 text-slate-300">{formatGen(policy.paid_total)}</dd>
											</div>
										</>
									) : null}
								</dl>

								{covered ? (
									<p className="mt-4 flex items-center gap-1.5 text-xs text-neon-lime">
										<BadgeCheck size={14} />
										Eligible payout recipient
										{policy?.source === "premium" ? " · premium paid" : " · granted by provider"}
									</p>
								) : wallet.address ? (
									<button
										type="button"
										className="btn-violet mt-4 w-full"
										disabled={busyUrl !== null}
										onClick={() => subscribe(service.url)}
									>
										<ShieldPlus size={15} />
										{busyUrl === service.url
											? "Waiting for finalization…"
											: "Buy coverage for " + formatGen(sla.stats?.premium_amount ?? 0)}
									</button>
								) : (
									<button type="button" className="btn-primary mt-4 w-full" onClick={wallet.connect}>
										Connect wallet to buy coverage
									</button>
								)}
							</div>
						)
					})}
				</div>
			)}

			{sla.isOwner ? (
				<div className="card mt-4">
					<h2 className="text-sm font-semibold text-slate-100">Grant coverage manually</h2>
					<p className="hint mt-1">
						Owner only. Use this for clients under an off-chain contract who should not pay a premium.
					</p>

					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<div>
							<label htmlFor="grant-url" className="label">
								Insured service
							</label>
							<select
								id="grant-url"
								className="input"
								value={grantUrl}
								onChange={(event) => setGrantUrl(event.target.value)}
								disabled={grantBusy}
							>
								<option value="">Select an endpoint…</option>
								{sla.activeServices.map((service) => (
									<option key={service.id} value={service.url}>
										{service.url}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="grant-address" className="label">
								Client address
							</label>
							<input
								id="grant-address"
								className="input"
								placeholder="0x…"
								value={grantAddress}
								onChange={(event) => setGrantAddress(event.target.value)}
								disabled={grantBusy}
							/>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							className="btn-primary"
							disabled={grantBusy || grantUrl === "" || grantAddress.trim().length !== 42}
							onClick={() => grant(false)}
						>
							<UserPlus size={15} />
							Grant policy
						</button>
						<button
							type="button"
							className="btn-ghost"
							disabled={grantBusy || grantUrl === "" || grantAddress.trim().length !== 42}
							onClick={() => grant(true)}
						>
							<UserMinus size={15} />
							Revoke policy
						</button>
					</div>

					{sla.policies.length > 0 ? (
						<div className="mt-5">
							<p className="label">Issued policies</p>
							<ul className="divide-y divide-white/5 rounded-xl border border-white/5">
								{sla.policies.map((policy) => {
									const service = sla.services.find((item) => item.id === policy.service_id)
									return (
										<li
											key={policy.service_id + "-" + policy.subscriber}
											className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3"
										>
											<AddressChip address={policy.subscriber} />
											<span className="mono truncate text-slate-500">
												{service ? hostOf(service.url) : "service #" + policy.service_id}
											</span>
											<Badge tone={policy.active ? "good" : "muted"}>
												{policy.active ? policy.source : "revoked"}
											</Badge>
										</li>
									)
								})}
							</ul>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	)
}
