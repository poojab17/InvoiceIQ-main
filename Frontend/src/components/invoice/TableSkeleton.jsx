export default function TableSkeleton() {
  return (
    <div className="p-6 animate-pulse">

      {[1,2,3,4,5].map((row)=>(
        <div
          key={row}
          className="grid grid-cols-7 gap-4 py-5 border-b border-gray-800"
        >

          {[1,2,3,4,5,6,7].map((cell)=>(
            <div
              key={cell}
              className="h-5 rounded bg-gray-800"
            />
          ))}

        </div>
      ))}

    </div>
  );
}