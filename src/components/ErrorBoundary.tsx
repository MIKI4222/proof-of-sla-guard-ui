import { Component, type ErrorInfo, type ReactNode } from "react"

type State = { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("Unhandled UI error", error, info)
	}

	render() {
		if (!this.state.error) return this.props.children

		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="card max-w-lg text-center">
					<h1 className="text-lg font-semibold text-slate-50">Something went wrong</h1>
					<p className="mt-2 text-sm text-slate-400">{this.state.error.message}</p>
					<button
						type="button"
						className="btn-primary mt-5"
						onClick={() => window.location.reload()}
					>
						Reload the app
					</button>
				</div>
			</div>
		)
	}
}
