import { JoinForm } from "./JoinForm";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <h1 className="font-display text-[36px] font-medium tracking-tight leading-tight">
          Outing Planner
        </h1>
        <p className="text-ink-soft mt-2 mb-8">
          Enter the family code to get started.
        </p>

        <JoinForm />

        {error === "invalid" && (
          <p className="mt-4 text-sm text-[#B93636]">
            That code didn&apos;t match any family. Check the link or ask the
            person who set up the planner.
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-line">
          <p className="text-xs text-ink-mute mb-3">
            Don&apos;t have a code?
          </p>
          <a
            href="/setup"
            className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-line-strong transition"
          >
            Start a new calendar
          </a>
        </div>
      </div>
    </div>
  );
}
