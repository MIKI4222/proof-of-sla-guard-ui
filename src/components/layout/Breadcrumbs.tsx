import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { ROUTE_LABELS } from "./navigation"

export function Breadcrumbs() {
	const { pathname } = useLocation()
	const segments = pathname.split("/").filter(Boolean)

	if (segments.length === 0) return null

	return (
		<nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
			<Link to="/" className="transition hover:text-slate-300">
				Overview
			</Link>
			{segments.map((segment, index) => {
				const href = "/" + segments.slice(0, index + 1).join("/")
				const isLast = index === segments.length - 1
				const label = ROUTE_LABELS[segment] ?? "#" + segment
				return (
					<span key={href} className="flex items-center gap-1.5">
						<ChevronRight size={12} className="text-slate-700" />
						{isLast ? (
							<span className="text-slate-300">{label}</span>
						) : (
							<Link to={href} className="transition hover:text-slate-300">
								{label}
							</Link>
						)}
					</span>
				)
			})}
		</nav>
	)
}
