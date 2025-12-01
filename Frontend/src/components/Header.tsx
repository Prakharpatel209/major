import { Package, ShoppingCart, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./SearchBar";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/contexts/CartContext";

export const Header = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Package className="h-6 w-6" />
          <span className="font-bold text-xl">CampusRent</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <SearchBar />
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/explore")}>
            Explore
          </Button>
          <Button variant="ghost" onClick={() => navigate("/cart")} className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline ml-2">Cart</span>
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/list-item")}>
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline ml-2">List Item</span>
          </Button>
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/auth")}>
            <AvatarImage src="" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </nav>
      </div>
      
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
};
