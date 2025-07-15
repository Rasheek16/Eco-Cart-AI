import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IndianRupee, Clock, Leaf, Gift, Info, Zap } from "lucide-react";
// import { toast } from "sonner";
import { Toast } from "@radix-ui/react-toast";
import { toast } from "@/hooks/use-toast";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    expiry_date: Date;
    greenScore: number;
    alternatives: {
      price: { name: string; price: number; savings: number };
      expiry: { name: string; expiryDate: Date; extraDays: number };
      green: {
        name: string;
        greenScore: number;
        improvement: number;
        reason: string;
      };
    };
    swapped?: boolean;
  };
  onDonate: (item: any) => void;
  onAutoSwap?: (itemId: number, alternative: any) => void;
}

export const CartItem = ({ item, onDonate, onAutoSwap }: CartItemProps) => {
  const [showAlternativeReason, setShowAlternativeReason] = useState(false);
  
  const daysUntilExpiry = Math.ceil(
    (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  // const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 3;
  const expiryProgress = Math.max(
    0,
    Math.min(100, (daysUntilExpiry / 7) * 100),
  );

  const handleAutoSwap = () => {
    const alt = item.alternatives?.green;
    if (!alt) {
      toast({
        title: "No alternative available",
        description: `${item.name} does not have a greener option yet.`,
        variant: "destructive",
      });
      return;
    }
    onAutoSwap?.(item.id, alt); // ⬅️ parent handles API + UI update
  };
  return (
    <Card
      className={`transition-all duration-300 ${
        item.swapped ? "ring-2 ring-eco-primary shadow-lg" : "hover:shadow-md"
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.name}
                  {item.swapped && (
                    <Badge className="ml-2 bg-eco-primary">Optimized!</Badge>
                  )}
                </h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    item.greenScore >= 80
                      ? "default"
                      : item.greenScore >= 60
                      ? "secondary"
                      : "outline"
                  }
                  className={item.greenScore >= 80 ? "bg-eco-primary" : ""}
                >
                  Green Score: {item.greenScore}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
            </span>
            {isExpiringSoon && (
              <Badge variant="destructive" className="animate-pulse">
                Expiring Soon!
              </Badge>
            )}
          </div>
          <Progress
            value={expiryProgress}
            className={`h-2 ${isExpiringSoon ? "bg-red-100" : "bg-green-100"}`}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Alternatives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Alternative */}
          {item.alternatives?.price && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Lower Price</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {item.alternatives.price.name}
              </p>
              <p className="text-lg font-bold text-blue-600">
                ₹{item.alternatives.price.price}
                <span className="text-sm font-normal">
                  {" "}
                  (Save ₹{item.alternatives.price.savings})
                </span>
              </p>
            </div>
          )}

          {/* Expiry Alternative */}
          {item.alternatives?.expiry && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">
                  Longer Expiry
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {item.alternatives.expiry.name}
              </p>
              <p className="text-lg font-bold text-orange-600">
                +{item.alternatives.expiry.extraDays} days
              </p>
            </div>
          )}

          {/* Green Alternative */}
          {item.alternatives?.green && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Higher Green Score
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <Info className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Why this was suggested</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <p className="text-gray-700">
                        {item.alternatives.green.reason}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {item.alternatives.green.name}
              </p>
              <p className="text-lg font-bold text-green-600">
                Score: {item.alternatives.green.greenScore}
                <span className="text-sm font-normal">
                  {" "}
                  (+{item.alternatives.green.improvement})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleAutoSwap}
            className="flex-1 bg-eco-primary hover:bg-eco-secondary text-white"
            disabled={item.swapped || !item.alternatives?.green} // Add this condition
          >
            <Zap className="h-4 w-4 mr-2" />
            {item.swapped ? "Optimized!" : "Auto-Swap with Best Option"}
          </Button>

          {isExpiringSoon && (
            <Button
              onClick={() => onDonate(item)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Gift className="h-4 w-4 mr-2" />
              Donate This Item
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
