import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthForm({
  type = "login",
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {type === "signup" && (
        <Input
          type="text"
          placeholder="Full Name"
          required
        />
      )}

      <Input
        type="email"
        placeholder="Email address"
        required
      />

      <Input
        type="password"
        placeholder="Password"
        required
      />

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {type === "login" ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
}
