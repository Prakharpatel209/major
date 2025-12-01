import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, buildImageUrl } from "@/config/api";

const Explore = () => {
  const categories = ["All", "Tools", "Sports", "Electronics", "Vehicles", "Furniture", "Misc"];
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "All";
  const searchLocation = searchParams.get("location") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", { category: activeCategory, search: searchQuery, location: searchLocation, fromDate, toDate }],
    queryFn: async () => {
      let url = `/items?limit=40`;
      if (activeCategory !== "All") {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (searchLocation) {
        url += `&location=${encodeURIComponent(searchLocation)}`;
      }
      if (fromDate) {
        url += `&fromDate=${encodeURIComponent(fromDate)}`;
      }
      if (toDate) {
        url += `&toDate=${encodeURIComponent(toDate)}`;
      }
      const res = await apiRequest(url);
      if (!res.ok) {
        throw new Error("Failed to load items");
      }
      return res.json() as Promise<{
        items: Array<any>;
        pagination: { total: number };
      }>;
    },
  });

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    setSearchParams(params, { replace: true });
  };

  // Filter items client-side if backend doesn't support all filters
  let filteredItems = data?.items || [];
  
  // Apply client-side filtering as fallback
  if (searchLocation && filteredItems.length > 0) {
    filteredItems = filteredItems.filter((item: any) => {
      const location = item.location?.city || item.location?.address || "";
      return location.toLowerCase().includes(searchLocation.toLowerCase());
    });
  }

  const items = filteredItems.map((it: any) => {
    const imageUrl = buildImageUrl(it.images?.[0]);
    return {
      image: imageUrl,
      title: it.title,
      price: String(it.pricePerDay ?? 0),
      location: it.location?.city || it.category || "Unknown",
      rating: it.rating?.average ?? 0,
      reviewCount: it.rating?.count ?? 0,
      category: it.category ?? "Misc",
      distance: "—",
      ownerName: it.owner?.name || "Owner",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Recommended for you</h1>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === activeCategory ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Search Results Info */}
        {(searchQuery || activeCategory !== "All" || searchLocation || fromDate || toDate) && (
          <div className="mb-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2 items-center">
              {searchQuery && (
                <span>Search: &quot;{searchQuery}&quot;</span>
              )}
              {activeCategory !== "All" && (
                <span>Category: {activeCategory}</span>
              )}
              {searchLocation && (
                <span>Location: {searchLocation}</span>
              )}
              {(fromDate || toDate) && (
                <span>Dates: {fromDate || "?"} - {toDate || "?"}</span>
              )}
              {items.length > 0 && (
                <span className="ml-2">({items.length} item{items.length !== 1 ? "s" : ""} found)</span>
              )}
            </div>
          </div>
        )}

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading items...</div>
        ) : isError ? (
          <div className="text-sm text-destructive">Failed to load items.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {searchQuery || activeCategory !== "All" || searchLocation || fromDate || toDate
                  ? "No items found matching your criteria."
                  : "No items found."}
              </div>
            ) : (
              items.map((item: any) => <ItemCard key={item.title + item.image} {...item} />)
            )}
          </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full">
            Load more items
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Explore;
