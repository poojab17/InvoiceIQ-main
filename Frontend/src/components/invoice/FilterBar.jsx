export default function FilterBar({
  status,
  setStatus,
  sort,
  setSort,
}) {
  return (
    <div className="flex gap-3">

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="
          bg-[#111827]
          border
          border-gray-700
          rounded-lg
          px-4
          py-3
          text-gray-300
        "
      >
        <option value="All">All Status</option>
        <option value="Verified">Verified</option>
        <option value="Processing">Processing</option>
        <option value="Pending">Pending</option>
        <option value="Failed">Failed</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="
          bg-[#111827]
          border
          border-gray-700
          rounded-lg
          px-4
          py-3
          text-gray-300
        "
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>

    </div>
  );
}