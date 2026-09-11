import { AlertTriangle, Banknote, CircleSlash, Lock, ShieldCheck, Siren, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "../components/ui/Badge"
import { PageHeader } from "../components/ui/PageHeader"
import { Stepper } from "../components/ui/Stepper"
import { StatusCodePill } from "../components/ui/StatusCodePill"
import { useToast } from "../components/ui/Toast"
import { type Eligibility, type OutageVerdict } from "../config/genlayer"
import { useApp } from "../lib/appContext"
import { describeError } from "../lib/contract"
import { formatGen, hostOf, isValidHttpUrl } from "../lib/format"

export function ReportOutage() {
	const { wallet, sla } = useApp()
	const toast = useToast()

	const [url, setUrl] = useState("")
	const [stage, setStage] = useState(0)
	const [busy, setBusy] = useState(false)
	const [failed, setFailed] = useState(false)
	const [verdict, setVerdict] = useState<OutageVerdict | null>(null)
	const [errorText, setErrorText] = useState<string | null>(null)
	const [eligibility, setEligibility] = useState<Eligibility | null>(null)
	const [checking, setChecking] = useState(false)

	const service = sla.serviceByUrl(url)
	const policy = sla.policyForUrl(url)
	const fundEmpty = (sla.stats?.total_fund ?? 0) < (sla.stats?.compensation_amount ?? 0)

	// Gas-free pre-flight: ask the contract whether this claim would be accepted.
	useEffect(() => {
		if (!wallet.address || !isValidHttpUrl(url)) {
			setEligibility(null)
			return
		}
		let cancelled = false
		setChecking(true)
		const timer = window.setTimeout(async () => {
			const result = await sla.checkEligibility(url)
			if (!cancelled) {
				setEligibility(result)
				setChecking(false)
			}
		}, 400)
		return () => {
			cancelled = true
			window.clearTimeout(timer)
			window.clearTimeout(timer)
		}
	}, [sla, url, wallet.address, sla.lastUpdated])

	const canSubmit =
		Boolean(wallet.address) &&
		!wallet.isWrongNetwork &&
		!busy &&
		isValidHttpUrl(url) &&
		eligibility?.eligible !== false

	const submit = async () => {
		setBusy(true)
		setFailed(false)
		setVerdict(null)
		setErrorText(null)
		setStage(1)
		try {
			const result = await sla.reportOutage(url, (next) => setStage(next))
			setVerdict(result)
			if (result?.approved) {
				toast.success(
					"Outage confirmed",
					"Compensation of " + formatGen(result.payout) + " dispatched",
				)
			} else {
				toast.info("Claim rejected", result?.reason ?? "Validators found no outage")
			}
		} catch (caught) {
			const message = describeError(caught)
			setFailed(true)
			setErrorText(message)
			toast.error("Claim failed", message)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Report Outage"
				description="Pick an insured endpoint you are covered for. The contract verifies your policy and the incident state first, and only then do validators fetch the endpoint."
			/>

			<div className="grid gap-4 lg:grid-cols-5">
				<div className="card lg:col-span-3">
					<label htmlFor="target-url" className="label">
						Failing endpoint URL
					</label>
					<input
						id="target-url"
						className="input"
						placeholder="https://api.example.com/health"
						value={url}
						onChange={(event) => setUrl(event.target.value)}
						disabled={busy}
					/>
					{url !== "" && !isValidHttpUrl(url) ? (
						<p className="mt-1.5 text-xs text-neon-rose">Enter a full http:// or https:// URL</p>
					) : (
						<p className="hint mt-1.5">
							Validators run a real HTTP GET request. Only 5xx responses, outage markers in the body or
							an unreachable host are approved.
						</p>
					)}

					<div className="mt-4">
						<p className="label">Insured endpoints</p>
						{sla.activeServices.length === 0 ? (
							<p className="hint">
								No endpoint is insured yet.{" "}
								<Link to="/provider/services" className="underline">
									Register one first
								</Link>
								.
							</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{sla.activeServices.map((item) => (
									<button
										key={item.id}
										type="button"
										disabled={busy}
										onClick={() => setUrl(item.url)}
										className="chip transition hover:border-neon-cyan/40 hover:text-neon-cyan disabled:opacity-40"
										title={item.url}
									>
										<Zap size={12} />
										{hostOf(item.url) + item.url.replace(/^https?:\/\/[^/]+/, "")}
									</button>
								))}
							</div>
						)}
					</div>

					{isValidHttpUrl(url) ? (
						<div
							className={
								"mt-4 rounded-xl border p-3.5 text-xs " +
								(eligibility?.eligible
									? "border-neon-lime/25 bg-neon-lime/10 text-neon-lime"
									: eligibility
										? "border-neon-rose/25 bg-neon-rose/10 text-neon-rose"
										: "border-white/10 bg-white/5 text-slate-400")
							}
						>
							<div className="flex items-start gap-2.5">
								{eligibility?.eligible ? (
									<ShieldCheck size={15} className="mt-0.5 shrink-0" />
								) : (
									<Lock size={15} className="mt-0.5 shrink-0" />
								)}
								<div>
									<p className="font-medium">
										{!wallet.address
											? "Connect a wallet to check your coverage"
											: checking
												? "Checking eligibility…"
												: (eligibility?.reason ?? "Eligibility unknown")}
									</p>
									{eligibility?.incident_id ? (
										<p className="mono mt-1 opacity-80">incident {eligibility.incident_id}</p>
									) : null}
									{eligibility?.cooldown_remaining ? (
										<p className="mt-1 opacity-80">
											{Math.ceil(eligibility.cooldown_remaining / 60)} min left before you can claim
											again
										</p>
									) : null}
									{!service ? (
										<p className="mt-1 opacity-80">This URL is not on the insured list.</p>
									) : !policy?.active ? (
										<p className="mt-1 opacity-80">
											<Link to="/policies" className="underline">
												Buy coverage for this service
											</Link>{" "}
											to become an eligible payout recipient.
										</p>
									) : null}
								</div>
							</div>
						</div>
					) : null}

					{fundEmpty ? (
						<div className="mt-4 flex items-start gap-2.5 rounded-xl border border-neon-amber/25 bg-neon-amber/10 p-3 text-xs text-neon-amber">
							<AlertTriangle size={15} className="mt-0.5 shrink-0" />
							<p>
								The provider fund cannot cover a payout right now, so claims will revert.{" "}
								<Link to="/provider" className="underline">
									Top up the fund
								</Link>
								.
							</p>
						</div>
					) : null}

					<div className="mt-5 flex flex-wrap items-center gap-3">
						{wallet.address ? (
							<button type="button" className="btn-primary" disabled={!canSubmit} onClick={submit}>
								<Siren size={15} />
								{busy ? "Validators working…" : "Submit claim"}
							</button>
						) : (
							<button type="button" className="btn-primary" onClick={wallet.connect}>
								Connect wallet to claim
							</button>
						)}
						<span className="hint">
							Payout on approval: {formatGen(sla.stats?.compensation_amount ?? 0)}
						</span>
					</div>
				</div>

				<div className="card lg:col-span-2">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
						Consensus progress
					</h2>
					<Stepper stage={stage} failed={failed} />
					{stage === 0 ? (
						<p className="hint">Submit a claim to watch the validator pipeline in real time.</p>
					) : null}
					{stage === 2 && busy ? (
						<p className="hint animate-pulseline">
							This step waits for FINALIZED, which usually takes 15–60 seconds on Bradbury.
						</p>
					) : null}
				</div>
			</div>

			{errorText ? (
				<div className="card mt-4 border-neon-rose/30">
					<div className="flex items-start gap-3">
						<CircleSlash size={18} className="mt-0.5 shrink-0 text-neon-rose" />
						<div>
							<p className="text-sm font-medium text-slate-100">Claim did not settle</p>
							<p className="mt-1 text-sm text-slate-400">{errorText}</p>
							<button type="button" className="btn-ghost btn-sm mt-3" onClick={submit} disabled={busy}>
								Retry the claim
							</button>
						</div>
					</div>
				</div>
			) : null}

			{verdict ? (
				<div
					className={
						"card mt-4 animate-slidein " +
						(verdict.approved ? "border-neon-lime/30" : "border-white/10")
					}
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<span
								className={
									"flex h-10 w-10 items-center justify-center rounded-xl border " +
									(verdict.approved
										? "border-neon-lime/30 bg-neon-lime/10 text-neon-lime"
										: "border-white/10 bg-white/5 text-slate-400")
								}
							>
								<Banknote size={18} />
							</span>
							<div>
								<p className="text-base font-semibold text-slate-50">
									{verdict.approved ? "Outage confirmed by consensus" : "No outage detected"}
								</p>
								<p className="hint mt-0.5">{verdict.reason}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{verdict.incident_id ? (
								<Badge tone="muted">incident {verdict.incident_id}</Badge>
							) : null}
							<StatusCodePill code={verdict.status_code} />
							<Badge tone={verdict.approved ? "good" : "muted"}>
								{verdict.approved ? formatGen(verdict.payout) : "no payout"}
							</Badge>
						</div>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<Link to={"/claims/" + verdict.claim_id} className="btn-ghost btn-sm">
							Open claim #{verdict.claim_id}
						</Link>
						<Link to="/claims" className="btn-ghost btn-sm">
							All claims
						</Link>
					</div>
				</div>
			) : null}
		</div>
	)
}
