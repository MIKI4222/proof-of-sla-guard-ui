import type { ReactNode } from "react"

type Tone = "good" | "bad" | "warn" | "info" | "muted"

const TONES: Record<Tone, string> = {
	good: "border-neon-lime/30 bg-neon-lime/10 text-neon-lime",
	bad: "border-neon-rose/30 bg-neon-rose/10 text-neon-rose",
	warn: "border-neon-amber/30 bg-neon-amber/10 text-neon-amber",
	info: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
	muted: "border-white/10 bg-white/5 text-slate-400",
}

export function Badge({
	tone = "muted",
	children,
	icon,
}: {
	tone?: Tone
	children: ReactNode
	icon?: ReactNode
}) {
	return (
		<span
			className={
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium " +
				TONES[tone]
			}
		>
			{icon}
			{children}
		</span>
	)
}
