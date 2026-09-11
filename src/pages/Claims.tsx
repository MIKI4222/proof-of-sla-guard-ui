import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { ClaimsTable } from "../components/ui/ClaimsTable"
import { PageHeader } from "../components/ui/PageHeader"
import { useApp } from "../lib/appContext"
import { sameAddress } from "../lib/format"

const PAGE_SIZE = 10
type StatusFilter = "all" | "approved" | "rejected"

export function Claims() {
	const { wallet, sla } = useApp()
	const [status, setStatus] = useState<StatusFilter>("all")
	const [query, setQuery] = useState("")
	const [onlyMine, setOnlyMine] = useState(false)
	const [page, setPage] = useState(0)

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase()
		return sla.claims.filter((claim) => {
			if (status !== "all" && claim.status !== status) return false
			if (onlyMine && !sameAddress(claim.claimant, wallet.address ?? undefined)) return false
			if (needle !== "" && !claim.target_url.toLowerCase().includes(needle)) return false
			return true
		})
	}, [sla.claims, status, onlyMine, query, wallet.address])

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
	const current = Math.min(page, pageCount - 1)
	const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

	const filters: Array<{ id: StatusFilter; label: string }> = [
		{ id: "all", label: "All" },
		{ id: "approved", label: "Approved" },
		{ id: "rejected", label: "Rejected" },
	]

	return (
		<div>
			<PageHeader
				title="Claims"
				description="Every outage claim ever settled by validators, stored in contract state. Newest first."
			/>

			<div className="card mb-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						{filters.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									setStatus(item.id)
									setPage(0)
								}}
								className={
									"rounded-lg px-3 py-1.5 text-xs font-medium transition " +
									(status === item.id
										? "bg-neon-cyan/15 text-neon-cyan"
										: "text-slate-400 hover:bg-white/5 hover:text-slate-200")
								}
							>
								{item.label}
							</button>
						))}
						{wallet.address ? (
							<label className="ml-1 flex cursor-pointer items-center gap-2 text-xs text-slate-400">
								<input
									type="checkbox"
									checked={onlyMine}
									onChange={(event) => {
										setOnlyMine(event.target.checked)
										setPage(0)
									}}
									className="h-3.5 w-3.5 rounded border-white/20 bg-ink-900 accent-neon-cyan"
								/>
								Only my claims
							</label>
						) : null}
					</div>

					<div className="relative w-full lg:w-72">
						<Search
							size={14}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
						/>
						<input
							className="input pl-9"
							placeholder="Filter by endpoint…"
							value={query}
							onChange={(event) => {
								setQuery(event.target.value)
								setPage(0)
							}}
						/>
					</div>
				</div>
			</div>

			<div className="card overflow-hidden p-0">
				<ClaimsTable claims={visible} loading={sla.isLoading} />
			</div>

			{filtered.length > PAGE_SIZE ? (
				<div className="mt-4 flex items-center justify-between text-xs text-slate-500">
					<span>
						Showing {current * PAGE_SIZE + 1}–{Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of{" "}
						{filtered.length}
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="btn-ghost btn-sm"
							disabled={current === 0}
							onClick={() => setPage(current - 1)}
						>
							<ChevronLeft size={14} />
							Prev
						</button>
						<span className="mono">
							{current + 1} / {pageCount}
						</span>
						<button
							type="button"
							className="btn-ghost btn-sm"
							disabled={current >= pageCount - 1}
							onClick={() => setPage(current + 1)}
						>
							Next
							<ChevronRight size={14} />
						</button>
					</div>
				</div>
			) : null}
		</div>
	)
}
