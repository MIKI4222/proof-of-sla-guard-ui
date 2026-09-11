import { Compass } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState } from "../components/ui/EmptyState"

export function NotFound() {
	return (
		<div className="card">
			<EmptyState
				icon={<Compass size={20} />}
				title="Page not found"
				description="The route you opened does not exist in this dApp."
				action={
					<Link to="/" className="btn-primary btn-sm">
						Back to overview
					</Link>
				}
			/>
		</div>
	)
}
