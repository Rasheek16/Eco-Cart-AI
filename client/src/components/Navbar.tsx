import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageSquare, User, Leaf } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Don't show navbar on dashboard
  if (currentPath === "/dashboard") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-eco-primary">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">EcoCart</span>
              <span className="text-xs text-eco-primary font-medium">
                AI Assistant
              </span>
            </div>
          </Link>

          {/* Navigation Links and User Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/cart"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/cart")
                    ? "bg-eco-primary text-white"
                    : "text-gray-700 hover:bg-eco-light hover:text-eco-primary"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Smart Cart</span>
                {/* <Badge variant="secondary" className="ml-1"></Badge> */}
              </Link>

              <Link
                to="/chat"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/chat")
                    ? "bg-eco-primary text-white"
                    : "text-gray-700 hover:bg-eco-light hover:text-eco-primary"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Eco Assistant</span>
              </Link>
            </div>

            <Button
              asChild
              variant={isActive("/login") ? "default" : "outline"}
              size="sm"
            >
              <Link to="/login" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
