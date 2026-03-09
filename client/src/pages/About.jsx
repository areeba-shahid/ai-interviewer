import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import ceo from "../assets/ceo.jpeg";
const About = () => {
  const { user } = useAuth();

  const teamMembers = [
    {
      name: "Areeba Shahid",
      role: "CEO & Founder",
      bio: "Full Stack Developer",
      image: <img src={ceo} alt="Profile" />,
      social: "in/areeba-shahid-540105377",
    },
  ];

  const milestones = [
    { year: "2023", event: "AI Interviewer founded" },
    { year: "2023", event: "Launched MVP with 100 beta users" },
    { year: "2024", event: "Reached 10K active users" },
    { year: "2024", event: "Added voice recognition with Whisper AI" },
    { year: "2025", event: "Introduced real-time feedback system" },
    { year: "2026", event: "Now serving 50K+ candidates globally" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Democratize Interview Prep",
      description:
        "Quality interview practice should be accessible to everyone, everywhere.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Learning",
      description:
        "Leverage cutting-edge AI to provide personalized feedback at scale.",
    },
    {
      icon: "🌟",
      title: "Continuous Improvement",
      description:
        "Constantly evolving our platform based on user feedback and industry trends.",
    },
    {
      icon: "🤝",
      title: "Candidate Success First",
      description:
        "Every feature we build is designed to help you land your dream job.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Mission:{" "}
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Help You Succeed
              </span>
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              We're on a mission to level the playing field in tech hiring by
              providing AI-powered interview practice that's accessible,
              effective, and free for everyone.
            </p>
            {!user && (
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Join Our Community
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Story
                </span>
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                AI Interviewer was born from a simple observation: technical
                interviews are broken. They're stressful, unpredictable, and
                often don't reflect real job performance.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Our founder, Sarah, conducted hundreds of interviews at Google
                and noticed that even brilliant engineers struggled with
                interview pressure. The problem wasn't their skills—it was lack
                of practice with realistic scenarios.
              </p>
              <p className="text-lg text-gray-700">
                So we built AI Interviewer: a platform that uses cutting-edge AI
                to simulate real interviews, provide instant feedback, and help
                candidates build confidence before the big day.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-bold mb-4">
                  The Problem We Solve
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">→</span>
                    <span>
                      78% of candidates feel underprepared for technical
                      interviews
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">→</span>
                    <span>
                      Average candidate needs 5-10 practice interviews to feel
                      confident
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">→</span>
                    <span>
                      Only 15% have access to mock interviews with feedback
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-purple-600"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`w-5/12 ${
                        index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                      }`}
                    >
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <span className="text-2xl font-bold text-blue-600">
                          {milestone.year}
                        </span>
                        <h3 className="text-lg font-semibold mt-2">
                          {milestone.event}
                        </h3>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Values
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            The principles that guide everything we build
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} hover className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Flexbox Version */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Meet the{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Team
            </span>
          </h2>

          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Passionate experts dedicated to your success
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-2rem)] min-w-[250px]"
              >
                <Card key={index} hover className="text-center h-full">
                  <div className="text-2xl mb-4">{member.image}</div>

                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <a
                    href={`https://linkedin.com/${member.social}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of candidates who've already improved their interview
            skills
          </p>
          {!user ? (
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Get Started Free
              </Button>
            </Link>
          ) : (
            <Link to="/setup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Practice Interview
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;
