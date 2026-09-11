import {
	Activity,
	ArrowRight,
	Banknote,
	CheckCircle2,
	Coins,
	ScrollText,
	ShieldCheck,
	Siren,
} from "lucide-react"
import { Link } from "react-router-dom"
import { AddressChip } from "../components/ui/AddressChip"
import { ClaimsTable } from "../components/ui/ClaimsTable"
import { PageHeader } from "../components/ui/PageHeader"
import { StatCard } from "../components/ui/StatCard"
import { useApp } from "../lib/appContext"
import { formatGen } from "../lib/format"

const FLOW = [
	{
		icon: Coins,
		title: "Provider funds the pool",
		text: "An infrastructure provider deposits GEN as collateral for its uptime promise.",
	},
	{
		icon: Siren,
		title: "Client reports an outage",
		text: "Anyone hitting a 500, 502 or timeout files a claim with the failing URL.",
	},
	{
		icon: Activity,
		title: "Validators inspect the endpoint",
		text: "GenLayer validators perform the HTTP request themselves and compare results.",
	},
	{
		icon: Banknote,
		title: "Payout is instant",
		text: "On consensus the contract transfers compensation with no human arbiter.",
	},
]

export function Overview() {
	const { sla } = useApp()
	const loading = sla.isLoading
	const stats = sla.stats
	const recent = sla.claims.slice(0, 5)

	const payoutsLeft =
		stats && stats.compensation_amount > 0
			? Math.floor(stats.total_fund / stats.compensation_amount)
			: 0

	return (
		<div>
			<PageHeader
				title="Overview"
				description="Live state of the on-chain uptime insurance pool, arbitrated entirely by GenLayer AI validators."
				actions={
					<Link to="/report" className="btn-primary">
						<Siren size={15} />
						Report outage
					</Link>
				}
			/>

			{sla.error ? (
				<div className="mb-5 rounded-xl border border-neon-rose/30 bg-neon-rose/10 p-3.5 text-sm text-neon-rose">
					{sla.error}
				</div>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={<Coins size={17} />}
					label="Insurance fund"
					value={formatGen(stats?.total_fund ?? 0)}
					hint={"Covers about " + payoutsLeft + " more payouts"}
					loading={loading}
					accent="cyan"
				/>
				<StatCard
					icon={<Banknote size={17} />}
					label="Paid out"
					value={formatGen(stats?.total_paid_out ?? 0)}
					hint="Total compensation sent to claimants"
					loading={loading}
					accent="lime"
				/>
				<StatCard
					icon={<ShieldCheck size={17} />}
					label="Compensation"
					value={formatGen(stats?.compensation_amount ?? 0)}
					hint="Paid per confirmed outage"
					loading={loading}
					accent="violet"
				/>
				<StatCard
					icon={<ScrollText size={17} />}
					label="Claims"
					value={
						(stats?.claims_total ?? 0) +
						" total"
					}
					hint={
						(stats?.claims_approved ?? 0) +
						" approved · " +
						(stats?.claims_rejected ?? 0) +
						" rejected"
					}
					loading={loading}
					accent="amber"
				/>
			</div>

			<section className="mt-8 grid gap-4 lg:grid-cols-3">
				<div className="card lg:col-span-2">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
							How a claim is settled
						</h2>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						{FLOW.map((step, index) => (
							<div
								key={step.title}
								className="rounded-xl border border-white/5 bg-ink-900/40 p-4 transition hover:border-neon-cyan/20"
							>
								<div className="flex items-center gap-2.5">
									<span className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan">
										<step.icon size={15} />
									</span>
									<span className="mono text-slate-600">0{index + 1}</span>
								</div>
								<p className="mt-3 text-sm font-medium text-slate-100">{step.title}</p>
								<p className="hint mt-1">{step.text}</p>
							</div>
						))}
					</div>
				</div>

				<div className="card">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
						Policy
					</h2>
					<dl className="space-y-3.5 text-sm">
						<div>
							<dt className="hint">Provider</dt>
							<dd className="mt-1">
								<AddressChip address={stats?.owner} />
							</dd>
						</div>
						<div>
							<dt className="hint">Contract</dt>
							<dd className="mt-1">
								<AddressChip address={sla.contractAddress} size={6} />
							</dd>
						</div>
						<div>
							<dt className="hint">Monitored endpoints</dt>
							<dd className="mt-1 text-slate-200">
								{stats?.monitored ?? 0}{" "}
								<Link to="/provider/services" className="text-xs text-neon-cyan hover:underline">
									manage
								</Link>
							</dd>
						</div>
						<div>
							<dt className="hint">Status</dt>
							<dd className="mt-1 flex items-center gap-1.5 text-slate-200">
								{stats?.paused ? (
									<span className="text-neon-amber">Paused by provider</span>
								) : (
									<>
										<CheckCircle2 size={14} className="text-neon-lime" />
										Accepting claims
									</>
								)}
							</dd>
						</div>
					</dl>
				</div>
			</section>

			<section className="mt-8">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Recent claims
					</h2>
					<Link to="/claims" className="flex items-center gap-1 text-xs text-neon-cyan hover:underline">
						All claims
						<ArrowRight size={12} />
					</Link>
				</div>
				<div className="card overflow-hidden p-0">
					<ClaimsTable
						claims={recent}
						loading={loading}
						compact
						emptyAction={
							<Link to="/report" className="btn-ghost btn-sm">
								File the first claim
							</Link>
						}
					/>
				</div>
			</section>
		</div>
	)
}
