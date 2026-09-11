import { ArrowLeft, ExternalLink } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { AddressChip } from "../components/ui/AddressChip"
import { Badge } from "../components/ui/Badge"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Skeleton } from "../components/ui/Skeleton"
import { StatusCodePill } from "../components/ui/StatusCodePill"
import { EXPLORER_URL } from "../config/genlayer"
import { useApp } from "../lib/appContext"
import { formatGen, hostOf } from "../lib/format"

export function ClaimDetail() {
	const { id } = useParams()
	const { sla } = useApp()
	const claimId = Number(id)
	const claim = sla.claims.find((item) => item.id === claimId)

	if (sla.isLoading) {
		return (
			<div className="card space-y-3">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		)
	}

	if (!claim) {
		return (
			<div className="card">
				<EmptyState
					title={"Claim #" + id + " was not found"}
					description="It may not exist yet, or the contract state has not been indexed. Try refreshing the data."
					action={
						<Link to="/claims" className="btn-ghost btn-sm">
							Back to claims
						</Link>
					}
				/>
			</div>
		)
	}

	return (
		<div>
			<PageHeader
				title={"Claim #" + claim.id}
				description={"Validator verdict for " + hostOf(claim.target_url)}
				actions={
					<Link to="/claims" className="btn-ghost btn-sm">
						<ArrowLeft size={14} />
						All claims
					</Link>
				}
			/>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="card lg:col-span-2">
					<div className="flex flex-wrap items-center gap-2">
						<Badge tone={claim.status === "approved" ? "good" : "muted"}>{claim.status}</Badge>
						<StatusCodePill code={claim.status_code} />
						{claim.payout > 0 ? <Badge tone="info">{formatGen(claim.payout)}</Badge> : null}
					</div>

					<h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
						Validator reasoning
					</h2>
					<p className="mt-1.5 text-sm leading-relaxed text-slate-200">{claim.reason}</p>

					<h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
						Inspected endpoint
					</h2>
					<a
						href={claim.target_url}
						target="_blank"
						rel="noreferrer"
						className="mono mt-1.5 inline-flex items-center gap-1.5 break-all text-neon-cyan hover:underline"
					>
						{claim.target_url}
						<ExternalLink size={13} className="shrink-0" />
					</a>
				</div>

				<div className="card">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
						On-chain record
					</h2>
					<dl className="space-y-3.5 text-sm">
						<div>
							<dt className="hint">Claimant</dt>
							<dd className="mt-1">
								<AddressChip address={claim.claimant} />
							</dd>
						</div>
						<div>
							<dt className="hint">Payout</dt>
							<dd className="mono mt-1 text-slate-200">{formatGen(claim.payout)}</dd>
						</div>
						<div>
							<dt className="hint">Raw payout (wei)</dt>
							<dd className="mono mt-1 break-all text-slate-400">{claim.payout}</dd>
						</div>
						<div>
							<dt className="hint">Contract</dt>
							<dd className="mt-1">
								<a
									href={EXPLORER_URL + "/address/" + sla.contractAddress}
									target="_blank"
									rel="noreferrer"
									className="text-xs text-neon-cyan hover:underline"
								>
									View in explorer
								</a>
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	)
}
