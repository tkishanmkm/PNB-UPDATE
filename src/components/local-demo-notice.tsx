export function LocalDemoNotice({ className = '' }: { className?: string }) {
  return (
    <div
      role="note"
      className={`mx-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900 ${className}`}
    >
      <strong>Local demonstration only.</strong> This screen is not connected to PNB or any payment network. A completed step records a local entry in this browser only; no SMS is sent and no real money is moved.
    </div>
  );
}
