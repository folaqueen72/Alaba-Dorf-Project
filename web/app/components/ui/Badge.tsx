type Status =
  | "confirmed"
  | "preparing"
  | "ready"
  | "pending"
  | "failed"
  | "completed"
  | "info";

const styles: Record<Status, string> = {
  confirmed: "bg-lemon-600 border-lemon-600 text-white",
  preparing: "bg-lemon-100 border-lemon-600 text-lemon-800",
  ready: "bg-lemon-100 border-lemon-600 text-lemon-800",
  pending: "bg-white border-ash-400 text-ash-800",
  failed: "bg-ink border-ink text-white",
  completed: "bg-ash-800 border-ash-800 text-white",
  info: "bg-ash-100 border-ash-200 text-ash-800",
};

export function Badge({
  status = "info",
  children,
}: {
  status?: Status;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block text-[13px] font-bold px-3 py-1 rounded-full border ${styles[status]}`}
    >
      {children}
    </span>
  );
}
