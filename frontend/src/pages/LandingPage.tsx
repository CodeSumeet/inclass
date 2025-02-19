import { FC, memo } from "react";
import { Button } from "../components/ui/Button";
import Navbar from "../components/Navbar";
import {
  ArrowRight,
  BookOpen,
  Users,
  Video,
  MessageCircle,
  Calendar,
  Award,
  CheckCircle,
} from "lucide-react";
import HeroImage from "../assets/hero-illustration.svg";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Engage with course materials in a dynamic virtual classroom environment",
  },
  {
    icon: Video,
    title: "Live Sessions",
    description:
      "Join real-time video classes with crystal clear audio and video",
  },
  {
    icon: MessageCircle,
    title: "Instant Communication",
    description:
      "Chat and collaborate with classmates and instructors seamlessly",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Organize your classes and assignments with our intuitive calendar",
  },
];

const benefits = [
  "Enhanced student engagement",
  "Real-time collaboration tools",
  "Automated attendance tracking",
  "Interactive whiteboard features",
  "Integrated assessment tools",
  "Cloud recording & playback",
];

const LandingPage: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Virtual
                <span className="text-primary"> Classroom </span>
                Experience
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Inclass combines the best of virtual classrooms with powerful
                collaboration tools to create an engaging learning environment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                rightIcon={<ArrowRight />}
              >
                Get Started
              </Button>
            </div>
            <div className="flex items-center gap-4 text-gray-600"></div>
          </div>
          <div className="relative">
            <img
              src={HeroImage}
              alt="Virtual Classroom"
              className="w-full animate-float"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need for Virtual Learning
            </h2>
            <p className="text-gray-600">
              Powerful features designed to make online education more effective
              and engaging
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="edu-card p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="notebook-paper">
              <h2 className="text-3xl font-bold mb-8">Why Choose Inclass?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="sticky-note">
                <Users className="h-6 w-6 mb-2" />
                <h4 className="font-semibold mb-1">Community</h4>
                <p className="text-sm">Connect with other educators</p>
              </div>
              <div className="sticky-note">
                <Award className="h-6 w-6 mb-2" />
                <h4 className="font-semibold mb-1">Achievement</h4>
                <p className="text-sm">Track student progress</p>
              </div>
              {/* Add more sticky notes as needed */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(LandingPage);
