import { AlertTriangle } from "lucide-react"
import { useEffect, type ReactNode } from "react"

export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	danger = false,
	busy = false,
	onConfirm,
	onCancel,
}: {
	open: boolean
	title: string
	description?: ReactNode
	confirmLabel?: string
	cancelLabel?: string
	danger?: boolean
	busy?: boolean
	onConfirm: () => void
	onCancel: () => void
}) {
	useEffect(() => {
		if (!open) return
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onCancel()
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open, busy, onCancel])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
				onClick={() => !busy && onCancel()}
			/>
			<div
				role="dialog"
				aria-modal="true"
				className="relative w-full max-w-md animate-slidein rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-soft"
			>
				<div className="flex items-start gap-3">
					<span
						className={
							"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border " +
							(danger
								? "border-neon-rose/30 bg-neon-rose/10 text-neon-rose"
								: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan")
						}
					>
						<AlertTriangle size={18} />
					</span>
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-slate-50">{title}</h2>
						{description ? (
							<div className="mt-1.5 text-sm leading-relaxed text-slate-400">{description}</div>
						) : null}
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-2">
					<button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
						{cancelLabel}
					</button>
					<button
						type="button"
						className={danger ? "btn-danger" : "btn-primary"}
						onClick={onConfirm}
						disabled={busy}
					>
						{busy ? "Working…" : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	)
}
