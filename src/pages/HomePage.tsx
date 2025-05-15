import { Building2, Users, Calculator, FileText, Clock, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Employee Management',
      description: 'Centralized database for employee records with easy management tools'
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: 'Payroll Processing',
      description: 'Automated payroll calculations with scheduled and ad-hoc payments'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Tax Management',
      description: 'Automated tax calculations and compliance reporting'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Attendance Tracking',
      description: 'Integrated attendance and leave management system'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'Tech Solutions Inc.',
      content: 'PayrollPro has transformed how we manage payroll. The automation features save us countless hours each month.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Finance Manager',
      company: 'Global Innovations',
      content: 'The tax management system is incredibly accurate and keeps us compliant. Best payroll software we\'ve used.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Head',
      company: 'StartUp Hub',
      content: 'The interface is intuitive and the support team is always helpful. Highly recommend for growing businesses.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                PayrollPro
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.4)), url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNCQkJCQkIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMmMwLTEuMTA0LS44OTYtMi0yLTJzLTIgLjg5Ni0yIDIgLjg5NiAyIDIgMiAyLS44OTYgMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 mix-blend-overlay"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold">
              <span className="block text-gray-900 drop-shadow-md">Modern Payroll</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent drop-shadow-md">
                Made Simple
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-800 leading-relaxed drop-shadow-md font-medium">
              Streamline your payroll operations with our comprehensive solution. Handle everything from employee management to tax compliance in one place.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-blue-600/95 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg flex items-center group"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="px-8 py-4 bg-white/60 backdrop-blur-sm text-blue-700 rounded-xl font-medium hover:bg-white/80 transition-all border border-white/30 hover:border-blue-200"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Feature Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-blue-600 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMmMwLTEuMTA0LS44OTYtMi0yLTJzLTIgLjg5Ni0yIDIgLjg5NiAyIDIgMiAyLS44OTYgMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-100">Employees Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our customers have to say about their experience with PayrollPro
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mt-4 leading-relaxed">"{testimonial.content}"</p>
              <div className="mt-6">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg group"
          >
            Start Your Free Trial
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;