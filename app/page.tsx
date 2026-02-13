export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold">
          AulaFinder
        </h1>
        <p className="text-xl text-muted-foreground">
          Find available classrooms at Universidad de los Andes
        </p>
        <div className="bg-secondary p-8 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Phase 1: Project foundation complete. Ready for feature development.
          </p>
        </div>
      </div>
    </main>
  );
}
