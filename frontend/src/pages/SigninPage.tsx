import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Logo from "../assets/inclasslogo.svg";
import SignInIllustration from "../assets/SignupIllustration.svg";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import GoogleIcon from "../assets/googleicon.svg";
import { loginWithEmail, signInWithGoogle } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

const SignInPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({
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
      const userCredential = await loginWithEmail(
        formData.email,
        formData.password
      );
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithGoogle();
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-2">
      {/* Left: Sign In Form */}
      <div className="flex flex-col items-center justify-center px-6 lg:px-20 py-12 relative">
        <div className="w-full max-w-[400px] mx-auto space-y-6">
          {/* Logo */}
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

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500">Sign in to your Inclass account</p>
          </div>

          {/* Sign In Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5" />}
              required
            />

            <div className="space-y-4">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={<Lock className="h-5 w-5" />}
                required
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </Link>
              </div>
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
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          {/* Divider */}
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

          {/* Social Sign In */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="border-gray-200"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <img
              src={GoogleIcon}
              alt=""
              className="h-5 w-5 mr-2"
            />
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="font-medium text-primary hover:text-primary/90"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-white border-l border-gray-100">
        <div className="max-w-[420px] text-center">
          <img
            src={SignInIllustration}
            alt=""
            className="w-full h-auto mb-8 animate-float"
          />
          <h2 className="text-2xl font-semibold mb-2">
            Welcome to your Virtual Classroom
          </h2>
          <p className="text-gray-500">
            Join thousands of teachers and students using Inclass to enhance
            their learning experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
