import type { ReactNode } from "react"

export function PageHeader({
	title,
	description,
	actions,
}: {
	title: string
	description?: string
	actions?: ReactNode
}) {
	return (
		<header className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
				{description ? (
					<p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
		</header>
	)
}
