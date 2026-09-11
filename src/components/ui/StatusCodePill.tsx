import { statusCodeTone } from "../../lib/format"
import { Badge } from "./Badge"

export function StatusCodePill({ code }: { code: number }) {
	const tone = statusCodeTone(code)
	const toneMap = { good: "good", warn: "warn", bad: "bad", muted: "muted" } as const
	return (
		<Badge tone={toneMap[tone]}>
			{code === 0 ? "no response" : code === -1 ? "unknown" : "HTTP " + code}
		</Badge>
	)
}
