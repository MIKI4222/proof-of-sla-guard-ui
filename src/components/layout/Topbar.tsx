import { LogOut, Menu, Plug, RefreshCw, Wifi } from "lucide-react"
import { useApp } from "../../lib/appContext"
import { shortAddr } from "../../lib/format"
import { Badge } from "../ui/Badge"

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
	const { wallet, sla } = useApp()

	return (
		<header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-ink-900/80 px-4 py-3 backdrop-blur lg:px-8">
			<button
				type="button"
				onClick={onOpenMenu}
				aria-label="Open menu"
				className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden"
			>
				<Menu size={16} />
			</button>

			<div className="hidden items-center gap-2 sm:flex">
				<Badge tone={wallet.isWrongNetwork ? "warn" : "info"} icon={<Wifi size={12} />}>
					{wallet.isWrongNetwork ? "Wrong network" : "Bradbury Testnet"}
				</Badge>
				{sla.stats?.paused ? <Badge tone="warn">Paused</Badge> : null}
				{sla.isOwner ? <Badge tone="good">Provider</Badge> : null}
			</div>

			<div className="ml-auto flex items-center gap-2">
				<button
					type="button"
					onClick={() => sla.refresh({ silent: true })}
					className="btn-ghost btn-sm"
					title="Refresh on-chain data"
				>
					<RefreshCw size={14} className={sla.isRefreshing ? "animate-spin" : ""} />
					<span className="hidden sm:inline">Refresh</span>
				</button>

				{wallet.address ? (
					<div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 py-1 pl-3 pr-1">
						<span className="mono text-slate-200">{shortAddr(wallet.address)}</span>
						<button
							type="button"
							onClick={wallet.disconnect}
							title="Disconnect"
							aria-label="Disconnect wallet"
							className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-neon-rose"
						>
							<LogOut size={14} />
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={wallet.connect}
						disabled={wallet.isConnecting}
						className="btn-primary btn-sm"
					>
						<Plug size={14} />
						{wallet.isConnecting ? "Connecting…" : "Connect MetaMask"}
					</button>
				)}
			</div>
		</header>
	)
}
