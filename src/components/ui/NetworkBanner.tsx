import { AlertTriangle, Pause } from "lucide-react"
import { useApp } from "../../lib/appContext"

export function NetworkBanner() {
	const { wallet, sla } = useApp()

	if (!sla.isConfigured) {
		return (
			<div className="mb-5 flex items-start gap-3 rounded-xl border border-neon-rose/30 bg-neon-rose/10 p-3.5 text-sm text-neon-rose">
				<AlertTriangle size={18} className="mt-0.5 shrink-0" />
				<p>
					Contract address is not configured. Add <span className="mono">VITE_CONTRACT_ADDRESS</span> to
					your environment and rebuild the site.
				</p>
			</div>
		)
	}

	if (wallet.isWrongNetwork) {
		return (
			<div className="mb-5 flex flex-col gap-3 rounded-xl border border-neon-amber/30 bg-neon-amber/10 p-3.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3 text-sm text-neon-amber">
					<AlertTriangle size={18} className="mt-0.5 shrink-0" />
					<p>Your wallet is on a different network. Switch to GenLayer Bradbury Testnet to transact.</p>
				</div>
				<button type="button" className="btn-ghost btn-sm shrink-0" onClick={wallet.switchNetwork}>
					Switch network
				</button>
			</div>
		)
	}

	if (sla.stats?.paused) {
		return (
			<div className="mb-5 flex items-start gap-3 rounded-xl border border-neon-amber/30 bg-neon-amber/10 p-3.5 text-sm text-neon-amber">
				<Pause size={18} className="mt-0.5 shrink-0" />
				<p>The contract is paused by its owner. New outage claims are rejected until it is resumed.</p>
			</div>
		)
	}

	return null
}
