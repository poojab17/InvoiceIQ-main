export default function InsightCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass =
    "text-purple-400 bg-purple-500/10",
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#111827]
        p-5
        transition
        duration-200
        hover:border-white/[0.12]
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={20} />
      </div>


      <p
        className="
          mt-5
          text-sm
          text-gray-400
        "
      >
        {label}
      </p>


      <h3
        className="
          mt-2
          text-2xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {value}
      </h3>


      {description && (
        <p
          className="
            mt-2
            text-xs
            leading-5
            text-gray-600
          "
        >
          {description}
        </p>
      )}

    </div>
  );
}