import { Clock, Pause, Play, Save, ShieldCheck, Timer } from "lucide-react"
import { useState } from "react"
import { Badge } from "../components/ui/Badge"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import { PageHeader } from "../components/ui/PageHeader"
import { useToast } from "../components/ui/Toast"
import { useApp } from "../lib/appContext"
import { describeError } from "../lib/contract"
import { formatGen, toWei } from "../lib/format"

function formatDuration(seconds: number): string {
	if (seconds <= 0) return "disabled"
	if (seconds < 60) return seconds + " s"
	if (seconds < 3600) return Math.round(seconds / 60) + " min"
	return (seconds / 3600).toFixed(seconds % 3600 === 0 ? 0 : 1) + " h"
}

export function ProviderSettings() {
	const { sla } = useApp()
	const toast = useToast()

	const [amount, setAmount] = useState("0.01")
	const [premium, setPremium] = useState("0.001")
	const [window_, setWindow] = useState("3600")
	const [cooldown, setCooldown] = useState("900")
	const [busy, setBusy] = useState(false)
	const [confirmPause, setConfirmPause] = useState(false)

	const paused = sla.stats?.paused ?? false
	const fund = sla.stats?.total_fund ?? 0

	let coverage = 0
	try {
		const next = toWei(amount)
		coverage = next > 0n ? Math.floor(fund / Number(next)) : 0
	} catch {
		coverage = 0
	}

	const run = async (label: string, action: () => Promise<string>, detail: string) => {
		setBusy(true)
		try {
			await action()
			toast.success(label, detail)
		} catch (caught) {
			toast.error("Update failed", describeError(caught))
		} finally {
			setBusy(false)
		}
	}

	const togglePause = async () => {
		setBusy(true)
		try {
			if (paused) {
				await sla.unpause()
				toast.success("Contract resumed", "Claims are accepted again")
			} else {
				await sla.pause()
				toast.info("Contract paused", "New claims will be rejected")
			}
		} catch (caught) {
			toast.error("Action failed", describeError(caught))
		} finally {
			setBusy(false)
			setConfirmPause(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Policy settings"
				description="Owner controls for pricing, replay protection and the emergency circuit breaker."
				actions={<Badge tone={paused ? "warn" : "good"}>{paused ? "Paused" : "Active"}</Badge>}
			/>

			{!sla.isOwner ? (
				<div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-slate-400">
					You are viewing this page as a client. Connect the provider wallet to change settings.
				</div>
			) : null}

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="card">
					<h2 className="text-sm font-semibold text-slate-100">Compensation per outage</h2>
					<p className="hint mt-1">Current: {formatGen(sla.stats?.compensation_amount ?? 0)}</p>

					<label htmlFor="compensation" className="label mt-4">
						New amount in GEN
					</label>
					<input
						id="compensation"
						className="input"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						inputMode="decimal"
						disabled={!sla.isOwner || busy}
					/>
					<p className="hint mt-2">At this size the current fund covers about {coverage} payouts.</p>

					<button
						type="button"
						className="btn-primary mt-4 w-full"
						disabled={!sla.isOwner || busy}
						onClick={() =>
							run(
								"Compensation updated",
								() => sla.setCompensationAmount(toWei(amount)),
								"New payout: " + formatGen(toWei(amount)),
							)
						}
					>
						<Save size={15} />
						{busy ? "Waiting for finalization…" : "Save compensation"}
					</button>
				</div>

				<div className="card">
					<h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
						<ShieldCheck size={15} className="text-neon-violet" />
						Policy premium
					</h2>
					<p className="hint mt-1">
						Current: {formatGen(sla.stats?.premium_amount ?? 0)} · collected{" "}
						{formatGen(sla.stats?.total_premiums ?? 0)}
					</p>

					<label htmlFor="premium" className="label mt-4">
						New premium in GEN
					</label>
					<input
						id="premium"
						className="input"
						value={premium}
						onChange={(event) => setPremium(event.target.value)}
						inputMode="decimal"
						disabled={!sla.isOwner || busy}
					/>
					<p className="hint mt-2">
						Clients pay this once per service to become eligible. Premiums flow into the same fund that
						pays the compensations.
					</p>

					<button
						type="button"
						className="btn-violet mt-4 w-full"
						disabled={!sla.isOwner || busy}
						onClick={() =>
							run(
								"Premium updated",
								() => sla.setPremiumAmount(toWei(premium)),
								"New premium: " + formatGen(toWei(premium)),
							)
						}
					>
						<Save size={15} />
						Save premium
					</button>
				</div>

				<div className="card">
					<h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
						<Timer size={15} className="text-neon-cyan" />
						Incident window
					</h2>
					<p className="hint mt-1">
						Current: {formatDuration(sla.stats?.incident_window ?? 0)}
					</p>

					<label htmlFor="window" className="label mt-4">
						Seconds an incident stays compensated
					</label>
					<input
						id="window"
						className="input"
						value={window_}
						onChange={(event) => setWindow(event.target.value)}
						inputMode="numeric"
						disabled={!sla.isOwner || busy}
					/>
					<p className="hint mt-2">
						One outage is compensated once inside this window, so a service that stays down cannot drain
						the pool.
					</p>

					<button
						type="button"
						className="btn-primary mt-4 w-full"
						disabled={!sla.isOwner || busy}
						onClick={() =>
							run(
								"Incident window updated",
								() => sla.setIncidentWindow(Number(window_)),
								formatDuration(Number(window_)) + " between compensations of one incident",
							)
						}
					>
						<Save size={15} />
						Save window
					</button>
				</div>

				<div className="card">
					<h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
						<Clock size={15} className="text-neon-amber" />
						Per-client cooldown
					</h2>
					<p className="hint mt-1">Current: {formatDuration(sla.stats?.claim_cooldown ?? 0)}</p>

					<label htmlFor="cooldown" className="label mt-4">
						Seconds between claims of one address
					</label>
					<input
						id="cooldown"
						className="input"
						value={cooldown}
						onChange={(event) => setCooldown(event.target.value)}
						inputMode="numeric"
						disabled={!sla.isOwner || busy}
					/>
					<p className="hint mt-2">
						Counts for rejected claims too, so the contract cannot be used to poll an endpoint in a loop.
					</p>

					<button
						type="button"
						className="btn-primary mt-4 w-full"
						disabled={!sla.isOwner || busy}
						onClick={() =>
							run(
								"Cooldown updated",
								() => sla.setClaimCooldown(Number(cooldown)),
								formatDuration(Number(cooldown)) + " between claims per address",
							)
						}
					>
						<Save size={15} />
						Save cooldown
					</button>
				</div>
			</div>

			<div className="card mt-4">
				<h2 className="text-sm font-semibold text-slate-100">Circuit breaker</h2>
				<p className="hint mt-1">
					Pausing stops new claims and new policies without touching the fund.
				</p>

				<div className="mt-4 rounded-xl border border-white/5 bg-ink-900/40 p-4">
					<p className="text-xs uppercase tracking-wider text-slate-500">Current state</p>
					<p className="mt-1.5 text-lg font-semibold text-slate-50">
						{paused ? "Claims paused" : "Accepting claims"}
					</p>
				</div>

				<button
					type="button"
					className={paused ? "btn-primary mt-4" : "btn-danger mt-4"}
					disabled={!sla.isOwner || busy}
					onClick={() => setConfirmPause(true)}
				>
					{paused ? <Play size={15} /> : <Pause size={15} />}
					{paused ? "Resume claims" : "Pause claims"}
				</button>
			</div>

			<ConfirmDialog
				open={confirmPause}
				danger={!paused}
				busy={busy}
				title={paused ? "Resume accepting claims?" : "Pause the insurance policy?"}
				description={
					paused
						? "Clients will be able to file outage claims again immediately."
						: "While paused, every outage claim is rejected even if the endpoint is really down."
				}
				confirmLabel={paused ? "Resume" : "Pause"}
				onConfirm={togglePause}
				onCancel={() => setConfirmPause(false)}
			/>
		</div>
	)
}
