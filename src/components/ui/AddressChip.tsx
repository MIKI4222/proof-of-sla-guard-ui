import { ExternalLink } from "lucide-react"
import { EXPLORER_URL } from "../../config/genlayer"
import { shortAddr } from "../../lib/format"
import { CopyButton } from "./CopyButton"

export function AddressChip({
	address,
	size = 4,
	withExplorer = true,
	label,
}: {
	address?: string
	size?: number
	withExplorer?: boolean
	label?: string
}) {
	if (!address) return <span className="text-slate-500">&mdash;</span>

	return (
		<span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 py-0.5 pl-2.5 pr-1">
			{label ? <span className="text-xs text-slate-500">{label}</span> : null}
			<span className="mono text-slate-200">{shortAddr(address, size)}</span>
			<CopyButton value={address} compact label="Copy address" />
			{withExplorer ? (
				<a
					href={EXPLORER_URL + "/address/" + address}
					target="_blank"
					rel="noreferrer"
					title="Open in explorer"
					className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-neon-cyan"
				>
					<ExternalLink size={14} />
				</a>
			) : null}
		</span>
	)
}
