import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/contexts/CartContext";
import { formatCurrencyINR } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

interface ItemCardProps {
  image: string;
  title: string;
  price: string;
  location: string;
  rating: number;
  reviewCount: number;
  category: string;
  distance: string;
  ownerName: string;
  ownerAvatar?: string;
}

export const ItemCard = ({
  image,
  title,
  price,
  location,
  rating,
  reviewCount,
  category,
  distance,
  ownerName,
  ownerAvatar,
}: ItemCardProps) => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  
  // Get rental dates from URL params
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const handleAddToCart = () => {
    addToCart({
      image,
      title,
      pricePerDay: parseInt(price),
      location,
      rating: `${rating} (${reviewCount})`,
      category,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group border-border">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-border">
          {category}
        </Badge>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          <span className="font-bold text-foreground whitespace-nowrap">
            {formatCurrencyINR(Number(price))}/day
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
          <span>•</span>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-foreground font-medium">{rating}</span>
          <span>({reviewCount})</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={ownerAvatar} />
              <AvatarFallback>{ownerName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{distance} away</span>
          </div>
          <Button size="sm" className="rounded-full" onClick={handleAddToCart}>
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
