import { ArrowUpRight, ScrollText } from "lucide-react"
import { Link } from "react-router-dom"
import type { ClaimRecord } from "../../config/genlayer"
import { formatGen, shortAddr, shortUrl } from "../../lib/format"
import { Badge } from "./Badge"
import { EmptyState } from "./EmptyState"
import { Skeleton } from "./Skeleton"
import { StatusCodePill } from "./StatusCodePill"

export function ClaimsTable({
	claims,
	loading = false,
	compact = false,
	emptyAction,
}: {
	claims: ClaimRecord[]
	loading?: boolean
	compact?: boolean
	emptyAction?: React.ReactNode
}) {
	if (loading) {
		return (
			<div className="space-y-2 p-4">
				{[0, 1, 2, 3].map((row) => (
					<Skeleton key={row} className="h-11 w-full" />
				))}
			</div>
		)
	}

	if (claims.length === 0) {
		return (
			<EmptyState
				icon={<ScrollText size={20} />}
				title="No claims yet"
				description="Once an outage is reported, every validator verdict is stored on-chain and shows up here."
				action={emptyAction}
			/>
		)
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[42rem] border-collapse">
				<thead>
					<tr className="border-b border-white/5">
						<th className="table-head w-16">ID</th>
						<th className="table-head">Endpoint</th>
						<th className="table-head w-32">Status</th>
						<th className="table-head w-32">Response</th>
						<th className="table-head w-32">Payout</th>
						{!compact ? <th className="table-head w-36">Claimant</th> : null}
						<th className="table-head w-10" />
					</tr>
				</thead>
				<tbody>
					{claims.map((claim) => (
						<tr
							key={claim.id}
							className="group border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
						>
							<td className="table-cell mono text-slate-500">#{claim.id}</td>
							<td className="table-cell">
								<Link
									to={"/claims/" + claim.id}
									className="text-slate-200 transition group-hover:text-neon-cyan"
									title={claim.target_url}
								>
									{shortUrl(claim.target_url, compact ? 28 : 48)}
								</Link>
							</td>
							<td className="table-cell">
								<Badge tone={claim.status === "approved" ? "good" : "muted"}>{claim.status}</Badge>
							</td>
							<td className="table-cell">
								<StatusCodePill code={claim.status_code} />
							</td>
							<td className="table-cell mono text-slate-300">
								{claim.payout > 0 ? formatGen(claim.payout) : "—"}
							</td>
							{!compact ? (
								<td className="table-cell mono text-slate-500">{shortAddr(claim.claimant)}</td>
							) : null}
							<td className="table-cell text-right">
								<Link
									to={"/claims/" + claim.id}
									aria-label={"Open claim " + claim.id}
									className="inline-flex rounded-md p-1.5 text-slate-600 transition hover:bg-white/10 hover:text-neon-cyan"
								>
									<ArrowUpRight size={14} />
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
