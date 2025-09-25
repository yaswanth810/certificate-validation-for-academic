import React from 'react';
import { TrendingUp, Users, Shield, Clock, Award, Globe } from 'lucide-react';

const DemoStats: React.FC = () => {
  const stats = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Fraud Prevention",
      value: "$1.2B+",
      description: "Annual fraud losses prevented",
      trend: "+100%"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Verification Speed",
      value: "3.2s",
      description: "Average verification time",
      trend: "99.8% faster"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Certificates Issued",
      value: "12,847",
      description: "Blockchain certificates minted",
      trend: "+2,340% growth"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: "Scholarships Distributed",
      value: "$2.8M",
      description: "Automated scholarship funds",
      trend: "+890% efficiency"
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-600" />,
      title: "Global Verifications",
      value: "45,231",
      description: "Cross-border verifications",
      trend: "+156% monthly"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      title: "Platform Uptime",
      value: "99.97%",
      description: "Blockchain reliability",
      trend: "Enterprise grade"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Platform Impact & Performance
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-world results from our blockchain certificate verification platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {stat.icon}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {stat.trend}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.title}
                </h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Impact Metrics */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Market Impact Projections
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50B+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Global Education Market</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Universities Worldwide</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Students Annually</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">32%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Credential Fraud Rate</div>
            </div>
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Blockchain Security</h4>
            <p className="text-blue-100">Ethereum-powered immutable records with cryptographic proof</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Smart Automation</h4>
            <p className="text-green-100">AI-driven scholarship distribution with zero human bias</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Global Scale</h4>
            <p className="text-purple-100">IPFS storage enabling worldwide instant verification</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStats;
