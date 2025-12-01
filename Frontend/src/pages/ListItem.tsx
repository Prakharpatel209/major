import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/config/api";




const ListItem = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const tabs = ["Details", "Media", "Pricing", "Policies", "Review"];
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Tools",
    pricePerDay: "",
    deposit: "",
    location: "",
    city: "",
    state: "",
    zipCode: "",
    pickupInstructions: "",
    condition: "Good",
    quantityAvailable: "1",
    tags: [] as string[],
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.pricePerDay) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, description, and price per day.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("pricePerDay", formData.pricePerDay);
      submitData.append("deposit", formData.deposit || "0");
      submitData.append("condition", formData.condition);
      submitData.append("quantityAvailable", formData.quantityAvailable);
      submitData.append("pickupInstructions", formData.pickupInstructions);
      
      // Add location as JSON string
      const location = {
        city: formData.city || formData.location,
        state: formData.state || "",
        zipCode: formData.zipCode || "",
        address: formData.location || "",
      };
      submitData.append("location", JSON.stringify(location));
      
      // Add tags as JSON array
      submitData.append("tags", JSON.stringify(formData.tags));
      
      // Add images
      images.forEach((image) => {
        submitData.append("images", image);
      });

      // API call to create item
      const response = await apiRequest("/items", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create listing");
      }

      const item = await response.json();
      
      toast({
        title: "Listing created successfully!",
        description: "Your item has been listed.",
      });
      
      // Navigate to explore page or item detail
      navigate("/explore");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast({
        title: "Failed to create listing",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Update main image preview when images change
  useEffect(() => {
    if (images.length > 0) {
      const url = URL.createObjectURL(images[0]);
      setMainImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMainImagePreview(null);
    }
  }, [images]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Compact Drill Driver Kit"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option>Tools</option>
                  <option>Sports</option>
                  <option>Electronics</option>
                  <option>Vehicles</option>
                  <option>Furniture</option>
                  <option>Misc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Include condition, what's included, ideal use, and any quirks."
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">City/Location</label>
                <Input
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Pickup instructions</label>
                <Input
                  placeholder="Curbside pickup only"
                  value={formData.pickupInstructions}
                  onChange={(e) => handleInputChange("pickupInstructions", e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  value={formData.condition}
                  onChange={(e) => handleInputChange("condition", e.target.value)}
                >
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity available</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.quantityAvailable}
                  onChange={(e) => handleInputChange("quantityAvailable", e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag (e.g., Cordless)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {formData.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags added yet</p>
                )}
              </div>
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload up to 10 images of your item. The first image will be used as the main photo.
              </p>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price per day (₹) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="18"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange("pricePerDay", e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Deposit (₹)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange("deposit", e.target.value)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Security deposit (optional)
                </p>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Competitive pricing increases booking rates. Check similar
                items in your area for reference.
              </p>
            </div>
          </div>
        );

      case "policies":
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Pickup Instructions</label>
              <Textarea
                placeholder="Provide clear instructions for pickup (e.g., 'Curbside pickup only', 'Ring doorbell', 'Call 30 minutes before arrival')"
                rows={4}
                value={formData.pickupInstructions}
                onChange={(e) => handleInputChange("pickupInstructions", e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Clear pickup instructions help renters and reduce
                misunderstandings.
              </p>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Listing</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-base">{formData.title || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-base">{formData.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price per day</p>
                  <p className="text-base">₹{formData.pricePerDay || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Images</p>
                  <p className="text-base">{images.length} image(s) uploaded</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold">Create a new listing</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab, index) => (
                <Badge
                  key={tab}
                  variant={activeTab === tab.toLowerCase() ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap"
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  <Info className="h-3 w-3 mr-1" />
                  {tab}
                </Badge>
              ))}
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit}>
                {renderTabContent()}

                <div className="flex justify-between mt-8 pt-8 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(
                        (tab) => tab.toLowerCase() === activeTab
                      );
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1].toLowerCase());
                      } else {
                        navigate("/");
                      }
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    {activeTab !== "review" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          const currentIndex = tabs.findIndex(
                            (tab) => tab.toLowerCase() === activeTab
                          );
                          if (currentIndex < tabs.length - 1) {
                            setActiveTab(tabs[currentIndex + 1].toLowerCase());
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                    {activeTab === "review" && (
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Publishing..." : "Publish Listing"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Listing preview</h2>
                <span className="text-sm text-muted-foreground">Auto-updates as you edit</span>
              </div>

              <div className="space-y-6">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {mainImagePreview ? (
                    <img
                      src={mainImagePreview}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Upload photos in Media tab</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price per day</span>
                    <span className="font-semibold">
                      ₹{Number(formData.pricePerDay || "0")}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deposit</span>
                    <span className="font-semibold">
                  ₹{(formData.deposit || "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-semibold">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Condition</span>
                    <span className="font-semibold">{formData.condition}</span>
                  </div>
                </div>
                
                {formData.title && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description || "No description yet"}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tips:</strong> Clear title, multiple angles, and honest condition increase booking rate.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
