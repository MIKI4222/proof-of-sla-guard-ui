import type { ReactNode } from "react"
import { Skeleton } from "./Skeleton"

export function StatCard({
	icon,
	label,
	value,
	hint,
	accent = "cyan",
	loading = false,
}: {
	icon: ReactNode
	label: string
	value: ReactNode
	hint?: ReactNode
	accent?: "cyan" | "violet" | "lime" | "amber"
	loading?: boolean
}) {
	const accents: Record<string, string> = {
		cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
		violet: "text-neon-violet bg-neon-violet/10 border-neon-violet/20",
		lime: "text-neon-lime bg-neon-lime/10 border-neon-lime/20",
		amber: "text-neon-amber bg-neon-amber/10 border-neon-amber/20",
	}

	return (
		<div className="card card-hover">
			<div className="flex items-start justify-between gap-3">
				<p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
				<span
					className={
						"flex h-9 w-9 items-center justify-center rounded-xl border " + accents[accent]
					}
				>
					{icon}
				</span>
			</div>
			<div className="mt-3">
				{loading ? (
					<Skeleton className="h-8 w-32" />
				) : (
					<p className="text-2xl font-semibold tracking-tight text-slate-50">{value}</p>
				)}
			</div>
			{hint ? <p className="hint mt-1.5">{hint}</p> : null}
		</div>
	)
}
