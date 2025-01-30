import { FC, memo } from "react";
import { Button } from "../components/ui/Button";
import Navbar from "../components/Navbar";
import {
  ArrowRight,
  BookOpen,
  LineChart,
  UsersRound,
  Video,
} from "lucide-react";
import livePreview from "../assets/livepreview.png";

const FeatureIcon = memo(({ Icon }: { Icon: JSX.Element }) => (
  <div className="flex items-center justify-center w-16 h-16 text-black border border-black rounded-full">
    {Icon}
  </div>
));

const features = [
  {
    icon: <Video size={32} />,
    title: "Live Classes",
    description: "Seamless virtual classes with high-quality video and audio.",
  },
  {
    icon: <BookOpen size={32} />,
    title: "Interactive Assessments",
    description: "Create and grade quizzes, assignments, and tests with ease.",
  },
  {
    icon: <LineChart size={32} />,
    title: "Progress Tracking",
    description:
      "Monitor student performance with detailed analytics and reports.",
  },
  {
    icon: <UsersRound size={32} />,
    title: "Collaborative Whiteboard",
    description:
      "Brainstorm and explain concepts with an interactive whiteboard.",
  },
];

const LandingPage: FC = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-black leading-tight">
            Transform Your Virtual Classroom Experience
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mt-4">
            Inclass combines the best of Google Classroom and Zoom to create an
            all-in-one solution for engaging, interactive online learning.
          </p>
          <Button
            size="lg"
            className="mt-6"
          >
            <a
              href="/auth/sign-up"
              className="flex items-center"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </section>

        {/* Live Preview */}
        <figure className="w-full flex justify-center mt-8">
          <img
            src={livePreview}
            alt="Live Class Preview"
            className="w-full max-w-4xl rounded-lg shadow-lg transition-all hover:scale-105 duration-300"
          />
        </figure>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 md:py-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 text-center mt-2 max-w-xl mx-auto">
            Everything you need to create an engaging virtual classroom.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, description }, index) => (
              <div
                key={index}
                className="px-6 py-8 bg-white rounded-xl flex flex-col items-center text-center border border-black shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <FeatureIcon Icon={icon} />
                <h3 className="text-xl font-semibold mt-4">{title}</h3>
                <p className="text-gray-700 mt-2">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-12 border-t border-gray-300 text-center">
          <p className="text-gray-600">
            &copy; 2025 Inclass. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
