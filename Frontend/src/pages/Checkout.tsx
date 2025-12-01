import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, CheckCircle2, Wallet, Smartphone, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrencyINR } from "@/lib/utils";

const Checkout = () => {
  const { items, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // PayPal
  const [paypalEmail, setPaypalEmail] = useState("");
  
  // UPI/Bank
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const itemsSubtotal = getSubtotal();
  const depositsTotal = items.reduce((sum, item) => sum + item.deposit, 0);
  const insurance = items.reduce((sum, item) => sum + item.insuranceCost, 0);
  const serviceFee = 24;
  const taxes = Math.round(itemsSubtotal * 0.08);
  const totalDueToday = itemsSubtotal + insurance + serviceFee + taxes;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on payment method
    if (!email) {
      toast({
        title: "Missing information",
        description: "Please provide your email address",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card" && (!cardNumber || !cardName || !expiry || !cvv)) {
      toast({
        title: "Missing information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "paypal" && !paypalEmail) {
      toast({
        title: "Missing information",
        description: "Please provide your PayPal email",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "upi" && !upiId) {
      toast({
        title: "Missing information",
        description: "Please provide your UPI ID",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "bank" && (!bankAccount || !ifscCode)) {
      toast({
        title: "Missing information",
        description: "Please provide bank account details",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      toast({
        title: "Payment successful!",
        description: `Your booking of ${items.length} item(s) has been confirmed.`,
      });

      // Clear cart after 2 seconds and redirect
      setTimeout(() => {
        clearCart();
        navigate("/");
      }, 3000);
    }, 2000);
  };

  if (items.length === 0 && !paymentComplete) {
    navigate("/cart");
    return null;
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16">
          <Card className="max-w-lg mx-auto p-12 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-2">
              Your booking has been confirmed
            </p>
            <p className="text-2xl font-bold text-primary mb-6">
              {formatCurrencyINR(totalDueToday)}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Check your email for booking details and pickup instructions
            </p>
            <Button onClick={() => navigate("/")} className="rounded-full">
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method Selection */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setPaymentMethod("card")}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-xs text-muted-foreground">Visa, Mastercard, Amex</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setPaymentMethod("paypal")}>
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5" />
                      <div>
                        <div className="font-medium">PayPal</div>
                        <div className="text-xs text-muted-foreground">Pay with your PayPal account</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setPaymentMethod("upi")}>
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <div className="font-medium">UPI</div>
                        <div className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setPaymentMethod("bank")}>
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-muted-foreground">Direct bank account transfer</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              {/* Payment Details */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                
                {/* Card Payment */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Payment */}
                {paymentMethod === "paypal" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paypalEmail">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        placeholder="your@paypal.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        You'll be redirected to PayPal to complete your payment securely
                      </p>
                    </div>
                  </div>
                )}

                {/* UPI Payment */}
                {paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-sm">
                      <p className="text-muted-foreground mb-2">
                        A payment request will be sent to your UPI app
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported apps: Google Pay, PhonePe, Paytm, BHIM
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Payment */}
                {paymentMethod === "bank" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        type="text"
                        placeholder="Enter account number"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        type="text"
                        placeholder="Enter IFSC code"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        Payment will be processed within 1-2 business days
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-6 p-4 bg-muted rounded-lg text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </Card>

              <Button
                type="submit"
                className="w-full h-14 text-lg rounded-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Pay {formatCurrencyINR(totalDueToday)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items subtotal</span>
                  <span className="font-medium">{formatCurrencyINR(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                  <span className="font-medium">{formatCurrencyINR(insurance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">{formatCurrencyINR(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">{formatCurrencyINR(taxes)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrencyINR(totalDueToday)}</span>
                </div>

                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Deposits (${depositsTotal})</p>
                  <p>Authorization holds released after return</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-sm mb-3">Your Items</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.days} days • {formatCurrencyINR(item.pricePerDay * item.days)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
