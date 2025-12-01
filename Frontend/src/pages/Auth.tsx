import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"renter" | "seller" | "admin">("renter");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const getPasswordStrength = () => {
    if (password.length < 4) return 0;
    if (password.length < 8) return 33;
    if (password.length < 12) return 66;
    return 100;
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Sign in or Create account</h1>
          
          {/* Role Selection */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={role === "renter" ? "default" : "outline"}
              onClick={() => setRole("renter")}
              className="flex-1 rounded-full"
            >
              Renter
            </Button>
            <Button
              variant={role === "seller" ? "default" : "outline"}
              onClick={() => setRole("seller")}
              className="flex-1 rounded-full"
            >
              Seller
            </Button>
            <Button
              variant={role === "admin" ? "default" : "outline"}
              onClick={() => setRole("admin")}
              className="flex-1 rounded-full"
            >
              Admin
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  type="tel"
                  placeholder="+1 555 000 1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {password && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Password strength</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strength < 50 ? "bg-destructive" : strength < 75 ? "bg-yellow-500" : "bg-success"
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use 8+ chars, a number, and a symbol
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              By continuing you agree to Terms and Privacy
            </p>

            <Button className="w-full h-12 rounded-full text-base" onClick={() => navigate("/")}>
              Continue
            </Button>

            <button className="text-sm text-primary hover:underline">
              Forgot password?
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 rounded-full">
                Continue with Google
              </Button>
              <Button variant="outline" className="h-12 rounded-full">
                Continue with Apple
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
