import { SetupForm } from "./SetupForm";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-[36px] font-medium tracking-tight leading-tight">
            Outing Planner
          </h1>
          <p className="text-ink-soft mt-2">
            Create a shared calendar for your group.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
