import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CartItem } from "@/components/CartItem";
import { GreenScoreGauge } from "@/components/GreenScoreGauge";
import { DonationModal } from "@/components/DonationModal";
import { ImpactSummaryModal } from "@/components/ImpactSummaryModal";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Leaf, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const SmartCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [donationItem, setDonationItem] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:8000/cart");
        let data = await res.json();
        if (data.length == 0) data = [];
        const parsedData = data.map((item) => ({
          ...item,
          product: {
            ...item.product,
            expiry_date: new Date(item.product.expiry_date),
          },
        }));
        // console.log(parsedData[0].product.alternatives);
        setCartItems(parsedData);
      } catch (err) {
        toast({ title: "Failed to fetch cart", description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const avgPackagingScore = Math.round(
    cartItems.reduce(
      (sum, item) => sum + (item.product.packaging_score || 0),
      0,
    ) / (cartItems.length || 1),
  );

  const avgLocalSourcingScore = Math.round(
    cartItems.reduce(
      (sum, item) => sum + (item.product.local_sourcing_score || 0),
      0,
    ) / (cartItems.length || 1),
  );

  const avgCarbonFootprintScore = Math.round(
    cartItems.reduce(
      (sum, item) => sum + (item.product.carbon_footprint_score || 0),
      0,
    ) / (cartItems.length || 1),
  );
  const [donatedItems, setDonatedItems] = useState([]);

  const handleDonate = (item) => {
    setDonationItem(item);
    setShowDonationModal(true);
  };
  const totalCost = [...cartItems, ...donatedItems].reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const confirmDonation = async () => {
    if (!donationItem) return;

    try {
      const res = await fetch(
        `http://localhost:8000/cart/${donationItem.cart_item_id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to donate item. Status: ${res.status}`);
      }

      // ✅ API success: remove from cart + add to donatedItems
      setCartItems((prev) =>
        prev.filter((item) => item.cart_item_id !== donationItem.cart_item_id),
      );
      setDonatedItems((prev) => [...prev, donationItem]);

      toast({
        title: "Item donated!",
        description: `${donationItem.product.name} will help reduce food waste.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Donation failed",
        description: "There was a problem removing the item from your cart.",
        variant: "destructive",
      });
    } finally {
      setShowDonationModal(false);
      setDonationItem(null);
    }
  };
  // 🔑 central swap handler
  const handleAutoSwap = async (
    cartItemId: number,
    alt: { name: string; greenScore: number /* … */ },
  ) => {
    try {
      // 1) optimistic UI – mark as swapped right away
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.cart_item_id === cartItemId ? { ...ci, swapped: true } : ci,
        ),
      );

      // 2) call backend
      const res = await fetch(`http://localhost:8000/cart/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          alternative: alt.name,
        }),
      });

      if (!res.ok) throw new Error(`Swap failed (${res.status})`);

      // 3) backend returns updated item → merge it in
      const updated = await res.json(); // { cart_item_id, product, greenScore, price, ... }
      setCartItems((prev) =>
        prev.map((ci) => (ci.cart_item_id === cartItemId ? updated : ci)),
      );

      toast({
        title: "Item optimized!",
        description: `${alt.name} has replaced the original item.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Auto‑swap failed",
        description: "We couldn’t swap this item. Please try again later.",
        variant: "destructive",
      });
      // 4) rollback optimistic change
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.cart_item_id === cartItemId ? { ...ci, swapped: false } : ci,
        ),
      );
    }
  };

  const averageGreenScore = Math.round(
    cartItems.reduce((sum, item) => sum + (item.product.green_score || 0), 0) /
      (cartItems.length || 1),
  );

  const totalSavings = cartItems.reduce((total, item) => {
    const diff = item.product.alternative_price_diff || 0;
    return total + (diff > 0 ? diff : 0);
  }, 0);

  const itemsExpiringSoon = cartItems.filter((item) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(item.product.expiry_date).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 3;
  }).length;

  const itemsDonated = 0; // Can be computed if you store removed/donated items

  const ecoBadgeProgress = Math.min(100, averageGreenScore); // Simplified logic

  const estimatedCO2PerItem = 0.2; // Dynamic factor if needed
  const packagingReducedPerItem = 1.5;

  return (
    <div className="container mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Smart Cart</h1>
            <p className="text-gray-600">AI-optimized shopping experience</p>
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="outline">View Dashboard</Button>
        </Link>
      </div>

      {/* Nudges */}
      <Card className="mb-8 border-eco-primary/20 bg-eco-muted/50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {totalSavings > 0 && (
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-eco-primary" />
                <span className="text-sm text-gray-700">
                  Optimizing your cart saved you ₹{totalSavings}
                </span>
              </div>
            )}
            {itemsExpiringSoon > 0 && (
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-700">
                  {itemsExpiringSoon} item{itemsExpiringSoon > 1 && "s"}{" "}
                  expiring soon. Consider donating.
                </span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Leaf className="h-5 w-5 text-eco-primary" />
              <span className="text-sm text-gray-700">
                Current green score: {averageGreenScore}/100
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p>Loading cart...</p>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.cart_item_id}
                item={{
                  id: item.cart_item_id,
                  quantity: item.quantity,
                  ...item.product,
                  greenScore: item.greenScore,
                  alternatives: item.product?.alternatives,
                  swapped: item.swapped,
                }}
                onDonate={() => handleDonate(item)}
                onAutoSwap={
                  item.product.alternatives?.green
                    ? (id, alt) => handleAutoSwap(id, alt)
                    : undefined
                }
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-eco-primary" />
                <span>Cart Green Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <GreenScoreGauge score={averageGreenScore} /> */}
              <GreenScoreGauge
                score={averageGreenScore}
                packaging={avgPackagingScore}
                localSourcing={avgLocalSourcingScore}
                carbonFootprint={avgCarbonFootprintScore}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cart Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-semibold">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiring Soon:</span>
                <Badge
                  variant={itemsExpiringSoon > 0 ? "destructive" : "secondary"}
                >
                  {itemsExpiringSoon}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Potential Savings:</span>
                <span className="font-semibold text-eco-primary">
                  ₹{totalSavings}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="font-semibold">₹{totalCost}</span>
              </div>
              <Button
                onClick={() => setShowImpactModal(true)}
                className="w-full eco-gradient text-white"
              >
                View Impact Summary
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎖️ EcoBadge Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next Badge</span>
                  <span>{ecoBadgeProgress}/100 points</span>
                </div>
                <Progress value={ecoBadgeProgress} className="h-2" />
                <p className="text-xs text-gray-600">
                  {100 - ecoBadgeProgress} more to next badge!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DonationModal
        open={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onConfirm={confirmDonation}
        item={donationItem}
      />

      <ImpactSummaryModal
        open={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        data={{
          co2Saved: +(cartItems.length * estimatedCO2PerItem).toFixed(2),
          packagingReduced: +(
            cartItems.length * packagingReducedPerItem
          ).toFixed(0),
          itemsDonated: itemsDonated,
          finalGreenScore: averageGreenScore,
        }}
      />
    </div>
  );
};

export default SmartCart;
