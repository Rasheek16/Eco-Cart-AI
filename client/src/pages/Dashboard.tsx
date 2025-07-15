import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Leaf, 
  Gift, 
  Award, 
  ShoppingCart, 
  MessageSquare, 
  Target,
  Calendar,
  IndianRupee,
  Users,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Mock data
  const stats = {
    totalSavings: 99803,
    greenScore: 82,
    itemsDonated: 23,
    co2Saved: 15.7,
    badgesEarned: 7
  };

  const recentDonations = [
    {
      id: 1,
      name: "Organic Greek Yogurt",
      donatedDate: "2 days ago",
      expiryDate: "1 day before expiry",
      impact: "0.3kg waste avoided"
    },
    {
      id: 2,
      name: "Artisan Bread",
      donatedDate: "1 week ago", 
      expiryDate: "2 days before expiry",
      impact: "0.5kg waste avoided"
    },
    {
      id: 3,
      name: "Organic Milk",
      donatedDate: "2 weeks ago",
      expiryDate: "3 days before expiry", 
      impact: "0.8kg waste avoided"
    }
  ];

  const badges = [
    { name: "Eco Warrior", icon: "🏆", description: "Made 50+ sustainable choices", unlocked: true },
    { name: "Waste Reducer", icon: "♻️", description: "Donated 20+ items", unlocked: true },
    { name: "Carbon Saver", icon: "🌱", description: "Saved 10kg+ CO₂", unlocked: true },
    { name: "Local Hero", icon: "🏪", description: "Support 10+ local businesses", unlocked: false },
    { name: "Zero Waste", icon: "🎯", description: "Achieve 90+ green score", unlocked: false },
    { name: "Community Champion", icon: "👥", description: "Influence 5+ friends", unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Dashboard Header */}
      <div className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Track your sustainable shopping journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link to="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Smart Cart
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Eco Assistant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Savings</p>
                  <p className="text-2xl font-bold text-green-700">₹{stats.totalSavings}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+12% vs last month</span>
                  </div>
                </div>
                <IndianRupee className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Green Score</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.greenScore}/100</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+8 points this week</span>
                  </div>
                </div>
                <Leaf className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Items Donated</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.itemsDonated}</p>
                  <div className="flex items-center text-xs text-purple-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+3 this week</span>
                  </div>
                </div>
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.co2Saved}kg</p>
                  <div className="flex items-center text-xs text-orange-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+2.3kg this month</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Badges Earned</p>
                  <p className="text-2xl font-bold text-indigo-700">{stats.badgesEarned}/10</p>
                  <div className="flex items-center text-xs text-indigo-600">
                    <Target className="h-3 w-3 mr-1" />
                    <span>3 more to go!</span>
                  </div>
                </div>
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Progress Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-eco-primary" />
                    <span>Monthly Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Green Score Target (85)</span>
                      <span className="font-medium">{stats.greenScore}/85</span>
                    </div>
                    <Progress value={(stats.greenScore / 85) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Donation Goal (30 items)</span>
                      <span className="font-medium">{stats.itemsDonated}/30</span>
                    </div>
                    <Progress value={(stats.itemsDonated / 30) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CO₂ Reduction (20kg)</span>
                      <span className="font-medium">{stats.co2Saved}/20kg</span>
                    </div>
                    <Progress value={(stats.co2Saved / 20) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Swapped to eco-friendly option</p>
                        <p className="text-xs text-gray-600">2 hours ago</p>
                      </div>
                      <Badge variant="secondary">+5 points</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Donated expiring yogurt</p>
                        <p className="text-xs text-gray-600">1 day ago</p>
                      </div>
                      <Badge variant="secondary">+10 points</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Earned "Waste Reducer" badge</p>
                        <p className="text-xs text-gray-600">3 days ago</p>
                      </div>
                      <Badge className="bg-purple-500">Badge!</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-eco-primary" />
                  <span>Donation History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{donation.name}</h3>
                        <p className="text-sm text-gray-600">Donated {donation.donatedDate}</p>
                        <p className="text-sm text-green-600">{donation.expiryDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {donation.impact}
                        </Badge>
                        <p className="text-xs text-gray-500">Impact</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Total Impact</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-700">1.6kg</p>
                      <p className="text-xs text-green-600">Waste Avoided</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">23</p>
                      <p className="text-xs text-green-600">Meals Provided</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">₹3,763</p>
                      <p className="text-xs text-green-600">Community Value</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <Card key={index} className={`${badge.unlocked ? 'border-eco-primary bg-eco-muted/20' : 'border-gray-200 bg-gray-50'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`text-4xl mb-3 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    <h3 className={`font-semibold mb-2 ${badge.unlocked ? 'text-eco-primary' : 'text-gray-500'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm ${badge.unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                      {badge.description}
                    </p>
                    {badge.unlocked && (
                      <Badge className="mt-3 bg-eco-primary">Earned!</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Savings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end justify-between space-x-2">
                    {[120, 240, 180, 320, 280, 450, 380].map((value, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-eco-primary rounded-t"
                          style={{ height: `${(value / 450) * 100}%` }}
                        />
                        <span className="text-xs text-gray-600 mt-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grocery</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-eco-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Household</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Personal Care</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
