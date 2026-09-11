import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react"

type ToastKind = "success" | "error" | "info"

type ToastItem = {
	id: number
	kind: ToastKind
	title: string
	description?: string
}

type ToastApi = {
	success: (title: string, description?: string) => void
	error: (title: string, description?: string) => void
	info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const STYLES: Record<ToastKind, { icon: ReactNode; ring: string }> = {
	success: { icon: <CheckCircle2 size={18} />, ring: "border-neon-lime/30 text-neon-lime" },
	error: { icon: <AlertTriangle size={18} />, ring: "border-neon-rose/30 text-neon-rose" },
	info: { icon: <Info size={18} />, ring: "border-neon-cyan/30 text-neon-cyan" },
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([])

	const remove = useCallback((id: number) => {
		setItems((current) => current.filter((item) => item.id !== id))
	}, [])

	const push = useCallback(
		(kind: ToastKind, title: string, description?: string) => {
			const id = Date.now() + Math.random()
			setItems((current) => [...current, { id, kind, title, description }])
			window.setTimeout(() => remove(id), kind === "error" ? 9000 : 5000)
		},
		[remove],
	)

	const api = useMemo<ToastApi>(
		() => ({
			success: (title, description) => push("success", title, description),
			error: (title, description) => push("error", title, description),
			info: (title, description) => push("info", title, description),
		}),
		[push],
	)

	return (
		<ToastContext.Provider value={api}>
			{children}
			<div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2">
				{items.map((item) => (
					<div
						key={item.id}
						role="status"
						className={
							"pointer-events-auto animate-slidein rounded-xl border bg-ink-800/95 p-3.5 shadow-soft backdrop-blur " +
							STYLES[item.kind].ring
						}
					>
						<div className="flex items-start gap-3">
							<span className="mt-0.5">{STYLES[item.kind].icon}</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-slate-100">{item.title}</p>
								{item.description ? (
									<p className="mt-0.5 break-words text-xs text-slate-400">{item.description}</p>
								) : null}
							</div>
							<button
								type="button"
								onClick={() => remove(item.id)}
								aria-label="Dismiss"
								className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
							>
								<X size={14} />
							</button>
						</div>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast(): ToastApi {
	const context = useContext(ToastContext)
	if (!context) throw new Error("useToast must be used inside ToastProvider")
	return context
}
