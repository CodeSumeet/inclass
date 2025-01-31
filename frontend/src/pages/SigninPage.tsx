import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import InclassLogo from "../assets/inclasslogo.svg";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import GoogleIcon from "../assets/googleicon.svg";
import SignupIllustration from "../assets/SignupIllustration.svg";
import QuarterCircle from "../assets/quartercircle.svg";
import { loginWithEmail, signInWithGoogle } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

const SigninPage: FC = () => {
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

  const handleSignin = async (e: React.FormEvent) => {
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

  const handleGoogleSignin = async () => {
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
    <div className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 md:px-12 bg-background">
      <figure className="hidden lg:block absolute top-0 right-0 w-28 md:w-36 lg:w-44">
        <img
          src={QuarterCircle}
          alt="Quarter Circle"
          className="w-full"
        />
      </figure>

      <div className="w-full max-w-lg py-8 px-8 md:px-10 flex flex-col items-center bg-white border border-black rounded-xl shadow-md lg:mr-12 xl:mr-20 transition-all">
        <figure className="mb-5">
          <img
            src={InclassLogo}
            alt="Inclass Logo"
            className="w-16"
          />
        </figure>

        <h1 className="text-3xl md:text-4xl font-bold text-black text-center">
          Welcome Back
        </h1>
        <p className="text-md md:text-lg text-gray-700 text-center mt-1">
          Sign in to your Inclass account
        </p>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <form
          onSubmit={handleSignin}
          className="w-full mt-6 flex flex-col space-y-4"
        >
          <Input
            variant="outlined"
            type="email"
            label="Email Address"
            name="email"
            placeholder="johndoe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            variant="outlined"
            type="password"
            label="Password"
            name="password"
            placeholder="•••••••••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button
            fullWidth
            size="lg"
            className="mt-4 hover:scale-105 active:scale-100"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4 text-sm text-gray-600 bg-white px-2">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <Button
          fullWidth
          variant="outline"
          size="lg"
          className="flex items-center justify-center gap-2"
          onClick={handleGoogleSignin}
          disabled={loading}
        >
          <img
            src={GoogleIcon}
            alt="Google Icon"
            width={22}
          />
          <p>{loading ? "Signing in..." : "Continue with Google"}</p>
        </Button>

        <div className="text-center mt-4 text-sm text-gray-700">
          Don't have an account?{" "}
          <Link
            to="/auth/sign-up"
            className="text-secondary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:items-center lg:w-1/2 relative">
        <figure className="lg:mr-16 xl:mr-24 lg:mt-28 animate-fade-in">
          <img
            src={SignupIllustration}
            alt="Signup Illustration"
            className="w-auto max-w-2xl"
          />
        </figure>
      </div>
    </div>
  );
};

export default SigninPage;
