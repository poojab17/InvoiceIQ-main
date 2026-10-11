export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">

      <input
        type="text"
        placeholder="Search invoice or vendor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          bg-[#111827]
          border
          border-gray-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-gray-500
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>
  );
}