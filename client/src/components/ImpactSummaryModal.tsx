
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Package, Gift, TrendingUp, Award } from "lucide-react";

interface ImpactSummaryModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    co2Saved: number;
    packagingReduced: number;
    itemsDonated: number;
    finalGreenScore: number;
  };
}

export const ImpactSummaryModal = ({ open, onClose, data }: ImpactSummaryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Award className="h-6 w-6 text-eco-primary" />
            <span>Your Environmental Impact</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Impact Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{data.co2Saved}kg</div>
                <div className="text-sm text-green-600">CO₂ Saved</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{data.packagingReduced}%</div>
                <div className="text-sm text-blue-600">Packaging Reduced</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{data.itemsDonated}</div>
                <div className="text-sm text-purple-600">Items Donated</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">{data.finalGreenScore}/100</div>
                <div className="text-sm text-orange-600">Final Green Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement */}
          <Card className="border-eco-primary bg-eco-muted">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-eco-primary mb-2">
                Eco Warrior Badge Unlocked!
              </h3>
              <p className="text-sm text-gray-700">
                You've made sustainable choices that positively impact the environment
              </p>
            </CardContent>
          </Card>

          {/* Comparison */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Your Impact Equivalent To:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🚗 Driving 18 fewer miles</li>
              <li>🌳 Planting 2 tree seedlings</li>
              <li>💧 Saving 15 gallons of water</li>
              <li>🍽️ Providing 3 meals to those in need</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={onClose} className="eco-gradient text-white px-8">
              Keep Shopping Sustainably
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
