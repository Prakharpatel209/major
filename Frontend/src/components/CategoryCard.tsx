import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  onClick?: () => void;
}

export const CategoryCard = ({ icon: Icon, name, onClick }: CategoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="flex items-center gap-3 p-4 cursor-pointer hover:shadow-md transition-all hover:scale-105 border-border"
    >
      <Icon className="h-5 w-5 text-foreground" />
      <span className="font-medium text-foreground">{name}</span>
    </Card>
  );
};
