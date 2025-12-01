import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, MapPin, Lock, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { formatCurrencyINR } from "@/lib/utils";

const Cart = () => {
  const { items, removeFromCart, getSubtotal } = useCart();
  const navigate = useNavigate();

  const itemsSubtotal = getSubtotal();
  const depositsTotal = items.reduce((sum, item) => sum + item.deposit, 0);
  const insurance = items.reduce((sum, item) => sum + item.insuranceCost, 0);
  const serviceFee = itemsSubtotal > 0 ? 24 : 0;
  const taxes = itemsSubtotal > 0 ? Math.round(itemsSubtotal * 0.08) : 0;
  const totalDueToday = itemsSubtotal + insurance + serviceFee + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16">
          <Card className="max-w-md mx-auto p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding items to rent and they'll appear here
            </p>
            <Button onClick={() => navigate("/explore")} className="rounded-full">
              Browse Items
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Your cart</h1>
              <span className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <span className="text-muted-foreground">{formatCurrencyINR(item.pricePerDay)}/day</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">{item.category}</span>
                        <span>• {item.rating}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-muted rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1">From</div>
                          <div className="text-sm font-medium">{item.fromDate || "Not set"}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1">To</div>
                          <div className="text-sm font-medium">{item.toDate || "Not set"}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1">Insurance</div>
                          <div className="text-sm font-medium">{item.insurance}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{item.days} day{item.days !== 1 ? 's' : ''} rental</span>
                          <span className="font-semibold ml-2">{formatCurrencyINR(item.pricePerDay * item.days)}</span>
                          <span className="text-xs text-muted-foreground ml-1">({formatCurrencyINR(item.pricePerDay)}/day × {item.days})</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Deposit: {formatCurrencyINR(item.deposit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items subtotal</span>
                  <span className="font-medium">{formatCurrencyINR(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposits (held)</span>
                  <span className="font-medium">{formatCurrencyINR(depositsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="font-medium">{formatCurrencyINR(insurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">{formatCurrencyINR(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">{formatCurrencyINR(taxes)}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total due today</span>
                <span>{formatCurrencyINR(totalDueToday)}</span>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-6 text-sm">
                <div className="text-muted-foreground mt-0.5">ⓘ</div>
                <p className="text-muted-foreground">
                  Deposits are authorization holds and are released after items are returned.
                </p>
              </div>

              <Button
                className="w-full h-12 rounded-full text-base mb-4"
                onClick={() => navigate("/checkout")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Proceed to checkout
              </Button>

              <Button variant="outline" className="w-full h-12 rounded-full text-base">
                Apply promo code
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
