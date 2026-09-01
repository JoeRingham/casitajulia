import { EnterForm } from "./EnterForm";

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Casita Julia
        </h1>
        <p className="text-sm text-muted">
          This site is private. Enter the password Julia gave you.
        </p>
      </div>
      <EnterForm next={next ?? "/"} />
    </div>
  );
}
