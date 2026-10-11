export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      {children}
    </div>
  );
}