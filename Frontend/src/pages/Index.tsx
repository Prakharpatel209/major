import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Wrench,
  Bike,
  Laptop,
  Car,
  Sofa,
  Package,
  Search,
  CalendarCheck,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-rentals.jpg";
import cameraImage from "@/assets/camera.jpg";
import bikeImage from "@/assets/bike.jpg";
import vanImage from "@/assets/van.jpg";
import toolsImage from "@/assets/tools.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  const categoryOptions = ["All", "Tools", "Sports", "Electronics", "Vehicles", "Furniture", "Misc"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchLocation.trim()) {
      params.set("location", searchLocation.trim());
    }
    if (searchFromDate) {
      params.set("fromDate", searchFromDate);
    }
    if (searchToDate) {
      params.set("toDate", searchToDate);
    }
    if (searchCategory && searchCategory !== "" && searchCategory !== "All") {
      params.set("category", searchCategory);
    }
    
    const queryString = params.toString();
    navigate(`/explore${queryString ? `?${queryString}` : ""}`);
  };

  const categories = [
    { icon: Wrench, name: "Tools" },
    { icon: Bike, name: "Sports" },
    { icon: Laptop, name: "Electronics" },
    { icon: Car, name: "Vehicles" },
    { icon: Sofa, name: "Furniture" },
    { icon: Package, name: "Misc" },
  ];

  const featuredItems = [
    {
      image: cameraImage,
      title: "Sony A7 III Camera",
      price: "42",
      location: "SF Downtown",
      rating: 5.0,
      reviewCount: 44,
      category: "Electronics",
      distance: "3km",
      ownerName: "John",
    },
    {
      image: bikeImage,
      title: "Trek Mountain Bike",
      price: "25",
      location: "Redwood City",
      rating: 4.9,
      reviewCount: 86,
      category: "Sports",
      distance: "5km",
      ownerName: "Sarah",
    },
    {
      image: vanImage,
      title: "Ford Transit Cargo Van",
      price: "95",
      location: "Daly City",
      rating: 4.7,
      reviewCount: 64,
      category: "Vehicles",
      distance: "8km",
      ownerName: "Mike",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Rent what you need, when you need it
              </h1>
              <p className="text-xl text-muted-foreground">
                Tools, Sports, Electronics, Vehicles, Furniture and more — from trusted locals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="text-lg h-14 px-8 rounded-full">
                  Start Renting
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 rounded-full"
                  onClick={() => navigate("/list-item")}
                >
                  List an Item
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Rental items"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container px-4 py-12">
        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Location</label>
                <Input
                  type="text"
                  placeholder="Enter a city or ZIP"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">From</label>
                <Input
                  type="date"
                  placeholder="Start date"
                  value={searchFromDate}
                  onChange={(e) => setSearchFromDate(e.target.value)}
                  className="h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">To</label>
                <Input
                  type="date"
                  placeholder="End date"
                  value={searchToDate}
                  onChange={(e) => setSearchToDate(e.target.value)}
                  className="h-12 rounded-lg"
                  min={searchFromDate || undefined}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background text-sm"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat === "All" ? "" : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">&nbsp;</label>
                <Button type="submit" className="w-full h-12 rounded-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </section>

      {/* Categories */}
      <section className="container px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Browse by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              icon={category.icon}
              name={category.name}
              onClick={() => navigate("/explore")}
            />
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="container px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured items</h2>
          <Button variant="ghost" onClick={() => navigate("/explore")}>
            View all
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <ItemCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">1. Search</h3>
            <p className="text-muted-foreground">
              Find items near you by category, price and dates.
            </p>
          </Card>
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">2. Book</h3>
            <p className="text-muted-foreground">
              Choose dates, add to cart, and confirm your booking.
            </p>
          </Card>
          <Card className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">3. Enjoy</h3>
            <p className="text-muted-foreground">
              Meet the owner, pick up your item, and enjoy. Protected by insurance.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Have gear to share?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start earning by listing your items in minutes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-14 px-8 text-lg rounded-full"
            onClick={() => navigate("/list-item")}
          >
            List Your Item
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CampusRent</h3>
              <p className="text-muted-foreground">
                Rent across Tools, Sports, Electronics, Vehicles, Furniture and more.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">Explore</li>
                <li className="hover:text-foreground cursor-pointer">How it works</li>
                <li className="hover:text-foreground cursor-pointer">Pricing</li>
                <li className="hover:text-foreground cursor-pointer">Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">About</li>
                <li className="hover:text-foreground cursor-pointer">Careers</li>
                <li className="hover:text-foreground cursor-pointer">Blog</li>
                <li className="hover:text-foreground cursor-pointer">Press</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t text-sm text-muted-foreground">
            <p>© 2025 CampusRent</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <span className="hover:text-foreground cursor-pointer">Terms</span>
              <span className="hover:text-foreground cursor-pointer">Privacy</span>
              <span className="hover:text-foreground cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
