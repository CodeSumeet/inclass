import { Button } from "../components/ui/Button";
import Navbar from "../components/Navbar";
import { FC } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesColumn,
  UsersRound,
  Video,
} from "lucide-react";
import livePreview from "../assets/livepreview.png";

interface LandingPageProps {}

const LandingPage: FC<LandingPageProps> = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
            Transform Your Virtual Classroom Experience
          </h1>
          <p className="text-lg md:text-xl text-black max-w-2xl mx-auto mt-4">
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
        <figure>
          <img
            src={livePreview}
            alt="Live Preview"
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

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              {
                icon: <Video />,
                title: "Live Classes",
                description:
                  "Conduct seamless virtual classes with high-quality video and audio.",
              },
              {
                icon: <BookOpen />,
                title: "Interactive Assessments",
                description:
                  "Create and grade quizzes, assignments, and tests with ease.",
              },
              {
                icon: <ChartNoAxesColumn />,
                title: "Progress Tracking",
                description:
                  "Monitor student performance with detailed analytics and reports.",
              },
              {
                icon: <UsersRound />,
                title: "Collaborative Whiteboard",
                description:
                  "Brainstorm ideas and explain concepts with an interactive digital whiteboard.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="px-6 py-6 bg-white rounded-md flex flex-col items-center text-center border border-black"
              >
                <div className="text-5xl text-center border border-black rounded-full p-4">
                  {feature.icon}
                </div>
                <h3 className="text-center text-xl font-semibold mt-4">
                  {feature.title}
                </h3>
                <p className="text-center mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 mt-12 border-t border-gray-300">
          <p className="text-center text-gray-600">
            &copy; 2024 Inclass. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
