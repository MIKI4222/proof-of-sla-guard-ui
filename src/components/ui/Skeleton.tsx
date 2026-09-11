export function Skeleton({ className = "h-4 w-24" }: { className?: string }) {
	return (
		<span
			className={
				"relative block overflow-hidden rounded-md bg-white/5 " + className
			}
		>
			<span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
		</span>
	)
}
