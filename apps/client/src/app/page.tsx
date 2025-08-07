export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Nexus Client Portal
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Manage your automated workflows and monitor performance
          </p>
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              The client portal is under development. You'll be able to view your workflows, manage exceptions, and track performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
