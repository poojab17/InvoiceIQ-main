import {
  ArrowLeft,
  FileQuestion,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function NotFound() {
  return (
    <div
      className="
        flex
        min-h-[70vh]
        items-center
        justify-center
      "
    >

      <div
        className="
          max-w-md
          text-center
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-indigo-500/10
          "
        >
          <FileQuestion
            size={30}
            className="text-indigo-400"
          />
        </div>


        <p
          className="
            mt-5
            text-xs
            font-semibold
            uppercase
            tracking-[0.18em]
            text-indigo-400
          "
        >
          Error 404
        </p>


        <h1
          className="
            mt-2
            text-3xl
            font-bold
            text-white
          "
        >
          Page not found
        </h1>


        <p
          className="
            mt-3
            text-sm
            leading-6
            text-gray-500
          "
        >
          The page you requested doesn't exist
          or may have been moved.
        </p>


        <Link
          to="/dashboard"
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-indigo-500
          "
        >
          <ArrowLeft size={16} />

          Back to Dashboard
        </Link>

      </div>

    </div>
  );
}