import { ShieldCheck, X } from "lucide-react"
import { NavLink } from "react-router-dom"
import { EXPLORER_URL } from "../../config/genlayer"
import { useApp } from "../../lib/appContext"
import { shortAddr } from "../../lib/format"
import { NAV_GROUPS } from "./navigation"

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
			{NAV_GROUPS.map((group) => (
				<div key={group.title}>
					<p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
						{group.title}
					</p>
					<ul className="space-y-1">
						{group.items.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									end={item.end}
									onClick={onNavigate}
									title={item.description}
									className={({ isActive }) =>
										"nav-link" + (isActive ? " nav-link-active" : "")
									}
								>
									<item.icon size={17} className="shrink-0" />
									<span className="truncate">{item.label}</span>
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	)
}

function Brand() {
	return (
		<div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
			<span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-cyan/25 bg-neon-cyan/10 text-neon-cyan shadow-glow">
				<ShieldCheck size={20} />
			</span>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-slate-50">Proof of SLA Guard</p>
				<p className="truncate text-[0.7rem] text-slate-500">Uptime insurance on GenLayer</p>
			</div>
		</div>
	)
}

function ContractFooter() {
	const { sla } = useApp()
	return (
		<div className="border-t border-white/5 px-5 py-4">
			<p className="text-[0.65rem] uppercase tracking-wider text-slate-600">Contract</p>
			<a
				href={EXPLORER_URL + "/address/" + sla.contractAddress}
				target="_blank"
				rel="noreferrer"
				className="mono mt-1 block text-slate-400 transition hover:text-neon-cyan"
			>
				{shortAddr(sla.contractAddress, 6)}
			</a>
			<p className="mt-2 text-[0.65rem] text-slate-600">Bradbury Testnet &middot; chain 41234</p>
		</div>
	)
}

export function Sidebar({
	mobileOpen,
	onClose,
}: {
	mobileOpen: boolean
	onClose: () => void
}) {
	return (
		<>
			<aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-800/40 lg:flex">
				<Brand />
				<NavItems />
				<ContractFooter />
			</aside>

			{mobileOpen ? (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" onClick={onClose} />
					<aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-ink-800 shadow-soft">
						<button
							type="button"
							onClick={onClose}
							aria-label="Close menu"
							className="absolute right-3 top-4 rounded-md p-2 text-slate-500 hover:bg-white/10 hover:text-slate-200"
						>
							<X size={16} />
						</button>
						<Brand />
						<NavItems onNavigate={onClose} />
						<ContractFooter />
					</aside>
				</div>
			) : null}
		</>
	)
}
