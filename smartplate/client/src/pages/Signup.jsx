import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your health journey with SmartPlate"
    >
      <AuthForm type="signup" />

      <p className="text-sm text-slate-400 mt-6 text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-emerald-500 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
