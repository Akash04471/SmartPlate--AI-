export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
            {subtitle}
          </p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
