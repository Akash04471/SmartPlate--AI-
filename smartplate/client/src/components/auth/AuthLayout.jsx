export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {title}
        </h1>
        <p className="text-slate-400 mb-6">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
