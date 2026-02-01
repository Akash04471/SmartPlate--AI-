import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">SmartPlate Dashboard</h1>
      <button
        onClick={logout}
        className="mt-4 text-red-500 underline"
      >
        Logout
      </button>
    </div>
  );
}
