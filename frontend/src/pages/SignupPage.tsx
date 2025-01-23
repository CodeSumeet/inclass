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
    <div className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-lg py-6 md:py-8 px-6 md:px-8 lg:px-10 flex flex-col items-center bg-white border border-black rounded-lg lg:mr-12 xl:mr-20">
        <figure className="mb-4 sm:mb-5">
          <img
            src={InclassLogo}
            alt="Inclass Logo"
            className="w-16"
          />
        </figure>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black text-center">
          Join Inclass
        </h1>
        <p className="text-sm sm:text-md md:text-lg text-black text-center mt-1">
          Create your account to get started
        </p>

        <form className="w-full mt-6 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <Input
              label="First Name"
              placeholder="John"
              className="w-full"
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              className="w-full"
            />
          </div>
          <Input
            type="email"
            label="Email Address"
            placeholder="johndoe@example.com"
          />
          <Input
            type="password"
            label="Password"
            placeholder="•••••••••••••••"
          />

          <Button
            fullWidth
            variant="filled"
            size="lg"
            className="mt-4"
          >
            Create Account
          </Button>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-black"></div>
            <span className="mx-4 text-sm text-black bg-white px-2">
              Or continue with
            </span>
            <div className="flex-grow border-t border-black"></div>
          </div>

          <Button
            fullWidth
            variant="outline"
            size="lg"
            className="border-black text-black flex items-center justify-center gap-2"
          >
            <img
              src={GoogleIcon}
              alt="Google Icon"
              width={22}
            />
            <p>Continue with Google</p>
          </Button>

          <div className="text-center mt-4 text-sm text-black">
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

      <div className="hidden lg:flex lg:flex-col lg:items-center lg:w-1/2">
        <figure className="absolute top-0 right-0">
          <img
            src={QuarterCircle}
            alt="Quarter Circle"
            className="w-24 md:w-32 lg:w-40"
          />
        </figure>

        <figure className="lg:mr-16 xl:mr-24 lg:mt-28">
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
