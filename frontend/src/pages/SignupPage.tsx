import { FC } from "react";
import InclassLogo from "../assets/inclasslogo.svg";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import GoogleIcon from "../assets/googleicon.svg";
import SignupIllustration from "../assets/SignupIllustration.svg";
import QuarterCircle from "../assets/quartercircle.svg";

const SignupPage: FC = () => {
  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 md:px-12 bg-background">
      <figure className="absolute top-0 right-0 w-28 md:w-36 lg:w-44">
        <img
          src={QuarterCircle}
          alt="Quarter Circle"
          className="w-full hidden lg:block"
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
          Join Inclass
        </h1>
        <p className="text-md md:text-lg text-gray-700 text-center mt-1">
          Create your account to get started
        </p>

        <form className="w-full mt-6 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <Input
              variant="outlined"
              label="First Name"
              placeholder="John"
              className="w-full"
            />
            <Input
              variant="outlined"
              label="Last Name"
              placeholder="Doe"
              className="w-full"
            />
          </div>
          <Input
            variant="outlined"
            type="email"
            label="Email Address"
            placeholder="johndoe@example.com"
          />
          <Input
            variant="outlined"
            type="password"
            label="Password"
            placeholder="•••••••••••••••"
          />

          <Button
            fullWidth
            size="lg"
            className="mt-4"
          >
            Create Account
          </Button>

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
            className="border-black text-black flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <img
              src={GoogleIcon}
              alt="Google Icon"
              width={22}
            />
            <p>Continue with Google</p>
          </Button>

          <div className="text-center mt-4 text-sm text-gray-700">
            Already have an account?{" "}
            <Link
              to="/auth/sign-in"
              className="text-secondary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
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

export default SignupPage;
