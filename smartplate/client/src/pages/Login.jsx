import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to SmartPlate"
    >
      <AuthForm type="login" />

      <p className="text-sm text-slate-400 mt-6 text-center">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-emerald-500 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
