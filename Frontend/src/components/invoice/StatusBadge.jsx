export default function StatusBadge({ status }) {
  const styles = {
    Verified: "bg-green-500/10 text-green-400 border-green-500/20",
    Processing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Failed: "bg-red-500/10 text-red-400 border-red-500/20",
    Pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs border font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}