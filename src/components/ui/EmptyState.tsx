import type { ReactNode } from "react"

export function EmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon?: ReactNode
	title: string
	description?: string
	action?: ReactNode
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
			{icon ? (
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
					{icon}
				</div>
			) : null}
			<p className="text-sm font-medium text-slate-200">{title}</p>
			{description ? <p className="max-w-md text-xs text-slate-500">{description}</p> : null}
			{action ? <div className="mt-2">{action}</div> : null}
		</div>
	)
}
