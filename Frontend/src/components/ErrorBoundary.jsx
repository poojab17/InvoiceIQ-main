import {
  Component,
} from "react";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";


export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }


  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }


  componentDidCatch(
    error,
    errorInfo
  ) {
    console.error(
      "InvoiceIQ UI Error:",
      error,
      errorInfo
    );
  }


  handleReload = () => {
    window.location.reload();
  };


  render() {
    if (
      this.state.hasError
    ) {
      return (
        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-[#080D18]
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              border
              border-red-500/20
              bg-[#111827]
              p-8
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-500/10
              "
            >
              <AlertTriangle
                size={27}
                className="text-red-400"
              />
            </div>


            <h1
              className="
                mt-5
                text-xl
                font-semibold
                text-white
              "
            >
              Something went wrong
            </h1>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              InvoiceIQ encountered an unexpected
              interface error. Your stored invoice
              data has not been modified.
            </p>


            <button
              type="button"
              onClick={
                this.handleReload
              }
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
              "
            >
              <RefreshCw size={16} />

              Reload Application
            </button>

          </div>

        </div>
      );
    }

    return this.props.children;
  }
}