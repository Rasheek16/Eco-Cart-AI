import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, Leaf, ShoppingCart, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const quickSuggestions = [
  "Suggest greener alternatives to shampoo",
  "Which item in my cart expires soon?",
  "How can I improve my green score?",
  "Find plastic-free packaging options",
  "Show me local sustainable brands",
  "What's the carbon footprint of my cart?",
];

export const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("eco_chat_messages");
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        const restored = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      } catch (err) {
        console.error("Failed to parse stored chat messages", err);
      }
    } else {
      // Initial message if no history
      setMessages([
        {
          id: 1,
          text: "Hi! I'm your Eco Assistant 🌱 I can help you make more sustainable shopping choices. What would you like to know?",
          isBot: true,
          timestamp: new Date(),
          suggestions: quickSuggestions.slice(0, 3),
        },
      ]);
    }
  }, []);

  // Save to localStorage on every message update
  useEffect(() => {
    localStorage.setItem("eco_chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const { response } = await res.json();
      const { final_message } = response;
      // console.log(await res.json());

      const botMessage: Message = {
        id: Date.now() + 1,
        text: final_message,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "⚠️ Oops! I couldn't reach the server.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eco Assistant</h1>
            <p className="text-gray-600">
              Your AI-powered sustainability guide
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-eco-light text-eco-primary">
            <Leaf className="h-3 w-3 mr-1" />
            Online
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.removeItem("eco_chat_messages");
              setMessages([]);
            }}
          >
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span>EcoBot</span>
                <Badge variant="secondary">AI Assistant</Badge>
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isBot
                            ? "bg-gray-100 text-gray-900"
                            : "bg-eco-primary text-white"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                        <div
                          className={`text-xs mt-1 opacity-70 ${
                            message.isBot ? "text-gray-500" : "text-green-100"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 ml-4">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs hover:bg-eco-light hover:border-eco-primary"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me about sustainable shopping..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage(inputValue)
                  }
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-eco-primary hover:bg-eco-secondary"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="w-[17rem]">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 w-fit">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  handleSuggestionClick("Which item in my cart expires soon?")
                }
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Expiring Items
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  handleSuggestionClick("How can I improve my green score?")
                }
              >
                <Leaf className="h-4 w-4 mr-2" />
                Improve Green Score
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Smart Cart
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="w-[17rem]">
            <CardHeader>
              <CardTitle className="text-lg">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-eco-light rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
