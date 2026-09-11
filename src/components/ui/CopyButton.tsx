import { Check, Copy } from "lucide-react"
import { useState } from "react"

export function CopyButton({
	value,
	label = "Copy",
	compact = false,
}: {
	value: string
	label?: string
	compact?: boolean
}) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value)
		} catch {
			const area = document.createElement("textarea")
			area.value = value
			document.body.appendChild(area)
			area.select()
			document.execCommand("copy")
			document.body.removeChild(area)
		}
		setCopied(true)
		window.setTimeout(() => setCopied(false), 1600)
	}

	const Icon = copied ? Check : Copy

	if (compact) {
		return (
			<button
				type="button"
				onClick={copy}
				aria-label={label}
				title={copied ? "Copied" : label}
				className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
			>
				<Icon size={14} />
			</button>
		)
	}

	return (
		<button type="button" onClick={copy} className="btn-ghost btn-sm">
			<Icon size={14} />
			{copied ? "Copied" : label}
		</button>
	)
}
