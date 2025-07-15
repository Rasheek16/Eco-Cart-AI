
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, MessageSquare, Leaf, TrendingUp, Award, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Shop Smarter with{" "}
              <span className="text-eco-primary">AI-Powered</span> Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Make better buying decisions with our intelligent shopping assistant. 
              Get personalized recommendations based on price, expiry dates, and sustainability scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="eco-gradient text-white hover:shadow-lg">
                <Link to="/cart" className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Try Smart Cart</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/chat" className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat with AI</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Smart Shopping Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover how our AI assistant helps you make sustainable and cost-effective shopping decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-eco-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-eco-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Optimization</h3>
                <p className="text-gray-600">
                  Find the best deals and get suggestions for lower-priced alternatives without compromising quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-eco-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-eco-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainability Score</h3>
                <p className="text-gray-600">
                  Get real-time green scores for products and discover eco-friendly alternatives that reduce your carbon footprint.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-eco-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-eco-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Waste Reduction</h3>
                <p className="text-gray-600">
                  Track expiry dates and get donation suggestions to minimize food waste and support your community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 eco-gradient-light">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-eco-primary mb-2">$2.3M</div>
              <p className="text-gray-700">Money Saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-eco-primary mb-2">15K+</div>
              <p className="text-gray-700">Items Donated</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-eco-primary mb-2">95%</div>
              <p className="text-gray-700">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-eco-primary" />
            <span className="text-xl font-bold">EcoCart AI</span>
          </div>
          <p className="text-gray-400 mb-6">
            🌱 Built with AI for a sustainable future | Powered by Walmart Sparkathon
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link to="/cart" className="hover:text-eco-primary transition-colors">Smart Cart</Link>
            <Link to="/chat" className="hover:text-eco-primary transition-colors">Eco Assistant</Link>
            <Link to="/login" className="hover:text-eco-primary transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
