import { CheckCircle2, Cpu, ExternalLink, FlaskConical, Network, ShieldCheck } from "lucide-react"
import { AddressChip } from "../components/ui/AddressChip"
import { Badge } from "../components/ui/Badge"
import { PageHeader } from "../components/ui/PageHeader"
import { CHAIN_ID, EXPLORER_URL, RPC_ENDPOINT } from "../config/genlayer"
import { useApp } from "../lib/appContext"

const VERIFIED_TESTS = [
	{
		scenario: 'report_outage("https://httpbin.org/status/500")',
		result: "approved · HTTP 500 · payout 0.01 GEN",
		tone: "good" as const,
	},
	{
		scenario: 'report_outage("https://httpbin.org/status/200")',
		result: "rejected · HTTP 200 · no payout",
		tone: "muted" as const,
	},
	{
		scenario: "claim for a URL outside the insured list",
		result: "reverted before the web verdict",
		tone: "good" as const,
	},
	{
		scenario: "claim from an address without a policy",
		result: "reverted: caller has no policy for this service",
		tone: "good" as const,
	},
	{
		scenario: "second claim for an already compensated incident",
		result: "reverted: incident 0:0 was already compensated",
		tone: "good" as const,
	},
	{
		scenario: "resolve_incident then claim again",
		result: "new incident 0:1 opened and paid once",
		tone: "good" as const,
	},
	{
		scenario: "owner-only writes from another address",
		result: "reverted by the owner guard",
		tone: "good" as const,
	},
]

const STACK = [
	{ icon: Cpu, title: "Intelligent Contract", text: "Python on GenLayer, DynArray state with JSON blobs" },
	{ icon: Network, title: "Consensus", text: "strict_eq Equivalence Principle over a real HTTP request" },
	{ icon: ShieldCheck, title: "Payouts", text: "emit_transfer to the claimant on finalization" },
	{ icon: FlaskConical, title: "Frontend", text: "React 18, Vite, TypeScript, Tailwind, genlayer-js" },
]

export function About() {
	const { sla } = useApp()

	return (
		<div>
			<PageHeader
				title="How it works"
				description="Architecture, deployment details and the verification runs behind this dApp."
			/>

			<div className="card">
				<h2 className="text-sm font-semibold text-slate-100">The problem</h2>
				<p className="mt-2 text-sm leading-relaxed text-slate-400">
					SLA credits today depend on the provider admitting its own outage. Claims go through support
					tickets, screenshots and manual review, and the party paying the compensation is the same party
					that decides whether the outage happened at all.
				</p>
				<h2 className="mt-5 text-sm font-semibold text-slate-100">The mechanism</h2>
				<p className="mt-2 text-sm leading-relaxed text-slate-400">
					SLA Guard removes the arbiter. A client reports the failing URL, and GenLayer validators fetch
					that endpoint themselves inside a non-deterministic block. The observed HTTP status is compared
					across validators through the Equivalence Principle, so the verdict is objective rather than a
					subjective model judgement. On agreement the contract transfers the compensation immediately — no
					oracle feed, no ticket, no human in the loop.
				</p>
			</div>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				{STACK.map((item) => (
					<div key={item.title} className="card card-hover">
						<div className="flex items-center gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-violet/20 bg-neon-violet/10 text-neon-violet">
								<item.icon size={16} />
							</span>
							<p className="text-sm font-medium text-slate-100">{item.title}</p>
						</div>
						<p className="hint mt-2.5">{item.text}</p>
					</div>
				))}
			</div>

			<div className="card mt-4">
				<h2 className="text-sm font-semibold text-slate-100">Verdict rules</h2>
				<ul className="mt-3 space-y-2 text-sm text-slate-400">
					<li className="flex gap-2">
						<CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neon-lime" />
						HTTP 5xx is an outage and is always approved.
					</li>
					<li className="flex gap-2">
						<CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neon-lime" />
						An unreachable host counts as an outage.
					</li>
					<li className="flex gap-2">
						<CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neon-lime" />
						4xx or an unknown status is approved only when the body carries an outage marker such as
						“bad gateway” or “service unavailable”.
					</li>
					<li className="flex gap-2">
						<CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neon-lime" />
						2xx and 3xx are healthy, so the claim is rejected and nothing is paid.
					</li>
				</ul>
			</div>

			<div className="card mt-4">
				<h2 className="text-sm font-semibold text-slate-100">Verified on Bradbury Testnet</h2>
				<p className="hint mt-1">Each scenario below was executed against the live deployment.</p>
				<div className="mt-4 space-y-2">
					{VERIFIED_TESTS.map((test) => (
						<div
							key={test.scenario}
							className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-ink-900/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
						>
							<p className="mono break-all text-slate-300">{test.scenario}</p>
							<Badge tone={test.tone}>{test.result}</Badge>
						</div>
					))}
				</div>
			</div>

			<div className="card mt-4">
				<h2 className="text-sm font-semibold text-slate-100">Deployment</h2>
				<dl className="mt-3 space-y-3 text-sm">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<dt className="hint">Contract</dt>
						<dd>
							<AddressChip address={sla.contractAddress} size={8} />
						</dd>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<dt className="hint">Network</dt>
						<dd className="text-slate-300">GenLayer Bradbury Testnet · chain {CHAIN_ID}</dd>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<dt className="hint">RPC</dt>
						<dd className="mono break-all text-slate-400">{RPC_ENDPOINT}</dd>
					</div>
				</dl>
				<a
					href={EXPLORER_URL + "/address/" + sla.contractAddress}
					target="_blank"
					rel="noreferrer"
					className="btn-ghost btn-sm mt-4"
				>
					Open in explorer
					<ExternalLink size={14} />
				</a>
			</div>

			<div className="card mt-4">
				<h2 className="text-sm font-semibold text-slate-100">Claim eligibility and replay protection</h2>
				<p className="hint mt-1">
					All six guards below run before the non-deterministic block, so the web verdict can never be
					the thing that authorises a payment.
				</p>
				<ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-400">
					<li>The contract must not be paused.</li>
					<li>The URL must be an active service configured by the owner.</li>
					<li>The caller must hold an active policy for that exact service.</li>
					<li>The caller cooldown must have expired, counting rejected claims too.</li>
					<li>The current incident must not already be compensated.</li>
					<li>The fund must cover a full payout.</li>
				</ol>
				<p className="hint mt-3">
					Each service carries an incident id such as 0:1. The first approved claim marks it compensated;
					later claims revert until the window elapses or the owner closes it. If the runtime clock is
					unavailable the lifecycle becomes a hard stop rather than silently allowing a drain.
				</p>
			</div>
		</div>
	)
}
