import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const Pricing = () => {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, annual: 0 },
      features: [
        "5 practice interviews per month",
        "Basic AI feedback",
        "Text-based responses",
        "Interview history (7 days)",
        "Community support",
      ],
      limitations: [
        "No voice recognition",
        "Limited question bank",
        "Basic analytics",
      ],
      cta: "Get Started",
      popular: false,
      color: "from-gray-600 to-gray-700",
    },
    {
      name: "Pro",
      description: "For serious job seekers",
      price: { monthly: 19, annual: 15 },
      features: [
        "Unlimited interviews",
        "Advanced AI feedback with scoring",
        "Voice recognition with Whisper AI",
        "Full interview history",
        "Priority email support",
        "Detailed performance analytics",
        "Custom question generation",
        "Mock system design interviews",
      ],
      cta: "Start Pro Trial",
      popular: true,
      color: "from-blue-600 to-purple-600",
      savings: "Save 20%",
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      price: { monthly: 49, annual: 39 },
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Custom interview templates",
        "API access",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom AI model training",
        "SSO integration",
        "Bulk user management",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-purple-600 to-pink-600",
    },
  ];

  const features = [
    "AI-powered questions",
    "Real-time feedback",
    "Voice recognition",
    "Performance analytics",
    "Interview history",
    "Custom questions",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Simple & Transparent Pricing
            <span className="block mt-1 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"></span>
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Choose the plan that fits your interview preparation needs. All
            plans include our core AI technology.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4 mb-8">
            <span
              className={`text-lg ${
                !annual ? "text-purple-900 font-semibold" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-16 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1 transition-colors"
            >
              <div
                className={`relative w-6 h-6  bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  annual ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-lg ${
                annual ? "text-purple-900 font-semibold" : "text-gray-500"
              }`}
            >
              Annual
              <span className="ml-2 text-sm text-green-600 font-normal">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden ${
                  plan.popular
                    ? "transform scale-105 shadow-2xl border-2 border-blue-600"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-gray-600">/month</span>
                    {annual && plan.price.annual > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Billed annually (${plan.price.annual * 12}/year)
                      </p>
                    )}
                  </div>

                  <Link
                    to={
                      plan.name === "Enterprise"
                        ? "/contact"
                        : user
                        ? "/setup"
                        : "/signup"
                    }
                  >
                    <Button
                      className={`w-full mb-6 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : plan.name === "Free"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Includes:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <svg
                              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Limitations:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <svg
                                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Compare{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Features
            </span>
          </h2>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-left">Feature</th>
                  <th className="py-4 px-6 text-center">Free</th>
                  <th className="py-4 px-6 text-center bg-blue-50">Pro</th>
                  <th className="py-4 px-6 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">Monthly Interviews</td>
                  <td className="py-4 px-6 text-center">5</td>
                  <td className="py-4 px-6 text-center bg-blue-50">
                    Unlimited
                  </td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">AI Feedback Quality</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Advanced</td>
                  <td className="py-4 px-6 text-center">Custom AI</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">Voice Recognition</td>
                  <td className="py-4 px-6 text-center">❌</td>
                  <td className="py-4 px-6 text-center bg-blue-50">✅</td>
                  <td className="py-4 px-6 text-center">✅</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">Interview History</td>
                  <td className="py-4 px-6 text-center">7 days</td>
                  <td className="py-4 px-6 text-center bg-blue-50">
                    Unlimited
                  </td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">Analytics</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Advanced</td>
                  <td className="py-4 px-6 text-center">Custom</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 font-medium">Support</td>
                  <td className="py-4 px-6 text-center">Community</td>
                  <td className="py-4 px-6 text-center bg-blue-50">
                    Priority Email
                  </td>
                  <td className="py-4 px-6 text-center">Dedicated Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold mb-2">
                Is there a free trial for Pro?
              </h3>
              <p className="text-gray-600">
                Yes! We offer a 14-day free trial on our Pro plan. No credit
                card required to start.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and for Enterprise
                plans, we can arrange invoicing.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time with no
                questions asked.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Interview Practice Today
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

export default Pricing;
