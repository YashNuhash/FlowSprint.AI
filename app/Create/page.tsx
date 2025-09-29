export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">Create Your AI Project</h1>
        <p className="text-lg text-muted-foreground">
          Start building with AI-powered tools and unleash your creativity.
        </p>
        <div className="mt-8 p-8 rounded-2xl border border-border bg-card">
          <p className="text-muted-foreground">Your creation workspace will appear here. Sign in to get started!</p>
        </div>
      </div>
    </div>
  )
}
