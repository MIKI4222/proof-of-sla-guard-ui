import { AlertTriangle, Check, Loader2 } from "lucide-react"

export const REPORT_STAGES = [
	{ title: "Sending Tx", detail: "Signing the claim in your wallet and broadcasting it" },
	{
		title: "GenLayer AI Validators Inspecting Web Endpoint",
		detail: "Validators perform a real HTTP request to the reported URL",
	},
	{ title: "Consensus Reached", detail: "Equivalence Principle confirms the observed status code" },
	{ title: "Payout Dispatched", detail: "Compensation is transferred from the provider fund" },
] as const

export function Stepper({
	stage,
	failed = false,
}: {
	/** 0 = idle, 1..4 = stage in progress or finished */
	stage: number
	failed?: boolean
}) {
	return (
		<ol className="relative space-y-1">
			{REPORT_STAGES.map((step, index) => {
				const position = index + 1
				const isDone = stage > position
				const isActive = stage === position
				const isFailed = failed && isActive
				const isLast = index === REPORT_STAGES.length - 1

				return (
					<li key={step.title} className="flex gap-3">
						<div className="flex flex-col items-center">
							<span
								className={
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition " +
									(isFailed
										? "border-neon-rose/40 bg-neon-rose/10 text-neon-rose"
										: isDone
											? "border-neon-lime/40 bg-neon-lime/10 text-neon-lime"
											: isActive
												? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
												: "border-white/10 bg-white/5 text-slate-500")
								}
							>
								{isFailed ? (
									<AlertTriangle size={14} />
								) : isDone ? (
									<Check size={14} />
								) : isActive ? (
									<Loader2 size={14} className="animate-spin" />
								) : (
									position
								)}
							</span>
							{!isLast ? (
								<span
									className={
										"my-1 w-px flex-1 " +
										(isDone ? "bg-neon-lime/30" : isActive ? "bg-neon-cyan/30 animate-pulseline" : "bg-white/10")
									}
								/>
							) : null}
						</div>
						<div className={"pb-5 pt-1 " + (isActive || isDone ? "opacity-100" : "opacity-55")}>
							<p className="text-sm font-medium text-slate-100">{step.title}</p>
							<p className="hint mt-0.5">{step.detail}</p>
						</div>
					</li>
				)
			})}
		</ol>
	)
}
