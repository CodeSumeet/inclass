import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Logo from "@/assets/inclasslogo.svg";
import SignUpIllustration from "@/assets/SignupIllustration.svg";
import GoogleIcon from "@/assets/googleicon.svg";
import { signUpWithEmail, signInWithGoogle } from "@/services/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input } from "@/components";

const SignUpPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      setUser(userCredential.user);
      navigate("/classes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithGoogle();
      setUser(userCredential.user);
      navigate("/classes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-6 lg:px-20 py-12">
        <div className="w-full max-w-[400px] mx-auto space-y-6">
          <Link
            to="/"
            className="flex items-center gap-2 mb-8"
          >
            <img
              src={Logo}
              alt=""
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">
              <span className="text-primary">In</span>
              <span className="text-gray-900">class</span>
            </span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-gray-500">
              Get started with your educational journey
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                icon={<User className="h-5 w-5" />}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                icon={<User className="h-5 w-5" />}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={<Mail className="h-5 w-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              icon={<Lock className="h-5 w-5" />}
              required
            />

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary/20"
                  required
                />
                <span className="text-sm text-gray-500">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-primary hover:text-primary/90"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:text-primary/90"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              fullWidth
              className="mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="border-gray-200"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <img
              src={GoogleIcon}
              alt=""
              className="h-5 w-5 mr-2"
            />
            {loading ? "Signing in..." : "Sign up with Google"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/auth/sign-in"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center bg-white border-l border-gray-100">
        <div className="max-w-[420px] text-center">
          <img
            src={SignUpIllustration}
            alt=""
            className="w-full h-auto mb-8 animate-float"
          />
          <h2 className="text-2xl font-semibold mb-2">
            Join Our Learning Community
          </h2>
          <p className="text-gray-500">
            Connect with students and educators from around the world in an
            interactive virtual environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
