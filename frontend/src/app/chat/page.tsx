"use client";

import React from "react";

import type { ReactElement } from "react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  Send,
  Bot,
  User,
  X,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProductService, {
  type Product,
  type UpdateProductData,
} from "@/lib/product-service";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  products?: Product[];
};

type ProductAction = {
  type: "edit" | "delete" | "price";
  productId: string | number;
  productName: string;
  newPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  currentPrice?: number;
};

// Memoized components for better performance
const MessageSkeleton = () => (
  <div className="flex justify-start">
    <div className="flex items-start gap-2 max-w-[80%]">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="flex items-center gap-2 p-2 rounded-md">
    <Skeleton className="h-10 w-10 rounded-md" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-3 w-[80px]" />
    </div>
    <div className="flex gap-1">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

const ProductItem = React.memo(
  ({
    product,
    onPriceClick,
    onEditClick,
    onDeleteClick,
  }: {
    product: Product;
    onPriceClick: (e: React.MouseEvent, product: Product) => void;
    onEditClick: (e: React.MouseEvent, product: Product) => void;
    onDeleteClick: (product: Product) => void;
  }) => (
    <div className="flex items-center gap-2 p-2 rounded-md bg-background hover:bg-accent transition-colors">
      <div className="h-10 w-10 relative rounded-md overflow-hidden">
        <Image
          src={
            product.image_url ||
            `/placeholder.svg?height=40&width=40&query=${
              encodeURIComponent(product.name) || "/placeholder.svg"
            }`
          }
          alt={product.name}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{product.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          ${product.price.toFixed(2)} - Qty: {product.quantity}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10"
          onClick={(e) => onPriceClick(e, product)}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10"
          onClick={(e) => onEditClick(e, product)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => onDeleteClick(product)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
);

ProductItem.displayName = "ProductItem";

const MessageBubble = React.memo(
  ({
    message,
    onPriceClick,
    onEditClick,
    onDeleteClick,
  }: {
    message: Message;
    onPriceClick: (e: React.MouseEvent, product: Product) => void;
    onEditClick: (e: React.MouseEvent, product: Product) => void;
    onDeleteClick: (product: Product) => void;
  }) => (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-start gap-2 max-w-[80%]">
        {message.sender === "bot" && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            message.sender === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm">{message.text}</p>

          {message.products && message.products.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.products.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onPriceClick={onPriceClick}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {message.sender === "user" && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
);

MessageBubble.displayName = "MessageBubble";

export default function ChatPage(): ReactElement {
  const router = useRouter();
  const { user, loading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm your PriceBot assistant. I can help you manage your products, analyze prices, and provide recommendations. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);
  const [pendingAction, setPendingAction] = useState<ProductAction | null>(
    null
  );
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateProductData>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    is_active: true,
    image_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Debounced input handler
  const debouncedSetInput = useCallback((value: string) => {
    setInput(value);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Optimized product fetching with error handling
  const fetchProducts = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingProducts(true);
      const products = await ProductService.getProducts();
      setUserProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoized bot response function
  const addBotMessage = useCallback(
    (text: string, productsList?: Product[]) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        sender: "bot",
        text,
        timestamp: new Date(),
        products: productsList,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    },
    []
  );

  // Optimized message processing
  const processUserMessage = useCallback(
    async (message: string) => {
      const lowerMessage = message.toLowerCase();
      setIsTyping(true);

      // Simulate typing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check for product listing intent
      if (
        lowerMessage.includes("list") &&
        (lowerMessage.includes("product") || lowerMessage.includes("item"))
      ) {
        if (userProducts.length === 0) {
          addBotMessage(
            "You don't have any products yet. Would you like to add a product?"
          );
        } else {
          addBotMessage(
            "Here are your products. You can edit or delete them:",
            userProducts
          );
        }
        return;
      }

      // Check for product deletion intent
      if (
        lowerMessage.includes("delete") &&
        (lowerMessage.includes("product") || lowerMessage.includes("item"))
      ) {
        if (userProducts.length === 0) {
          addBotMessage(
            "You don't have any products to delete. Would you like to add a product first?"
          );
          return;
        }
        addBotMessage(
          "Which product would you like to delete? Here are your products:",
          userProducts
        );
        return;
      }

      // Handle product selection for deletion
      if (pendingAction?.type === "delete") {
        const productId = pendingAction.productId;
        await handleDeleteProduct(Number(productId));
        return;
      }

      // Check for product actions
      if (lowerMessage.includes("delete") || lowerMessage.includes("remove")) {
        const productMatches = userProducts.filter((p) =>
          lowerMessage.includes(p.name.toLowerCase())
        );

        if (productMatches.length > 0) {
          const product = productMatches[0];
          setPendingAction({
            type: "delete",
            productId: product.id,
            productName: product.name,
          });

          addBotMessage(
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
          );
          return;
        }
      }

      if (lowerMessage.includes("edit") || lowerMessage.includes("update")) {
        if (
          lowerMessage.includes("information") ||
          lowerMessage.includes("details")
        ) {
          if (userProducts.length === 0) {
            addBotMessage(
              "You don't have any products to edit. Would you like to add a product first?"
            );
          } else {
            addBotMessage(
              "Which product would you like to edit? Here are your products:",
              userProducts
            );
          }
          return;
        }

        const productMatches = userProducts.filter((p) =>
          lowerMessage.includes(p.name.toLowerCase())
        );

        if (productMatches.length > 0) {
          const product = productMatches[0];
          setPendingAction({
            type: "edit",
            productId: product.id,
            productName: product.name,
          });

          addBotMessage(
            `What would you like to update for "${product.name}"? You can change the price, description, or other details.`
          );
          return;
        }
      }

      if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
        const productMatches = userProducts.filter((p) =>
          lowerMessage.includes(p.name.toLowerCase())
        );

        if (productMatches.length > 0) {
          const product = productMatches[0];

          // Try to extract price from message
          const priceMatch = lowerMessage.match(/\$?(\d+(\.\d{1,2})?)/);
          if (priceMatch) {
            const newPrice = Number.parseFloat(priceMatch[1]);

            setPendingAction({
              type: "price",
              productId: product.id,
              productName: product.name,
              newPrice,
              currentPrice: product.price,
            });

            addBotMessage(
              `Are you sure you want to change the price of "${
                product.name
              }" from $${product.price.toFixed(2)} to $${newPrice.toFixed(2)}?`
            );
            return;
          } else {
            addBotMessage(
              `What price would you like to set for "${
                product.name
              }"? The current price is $${product.price.toFixed(2)}.`
            );
            setPendingAction({
              type: "price",
              productId: product.id,
              productName: product.name,
              currentPrice: product.price,
            });
            return;
          }
        }
      }

      // Handle yes/no responses for pending actions
      if (pendingAction) {
        if (
          lowerMessage.includes("yes") ||
          lowerMessage.includes("confirm") ||
          lowerMessage.includes("proceed") ||
          lowerMessage.includes("ok")
        ) {
          await handleConfirmAction();
          return;
        }

        if (
          lowerMessage.includes("no") ||
          lowerMessage.includes("cancel") ||
          lowerMessage.includes("abort")
        ) {
          addBotMessage(
            `Action cancelled. Is there anything else I can help you with?`
          );
          setPendingAction(null);
          return;
        }

        // If there's a pending price action and the user entered a number
        if (pendingAction.type === "price") {
          const priceMatch = lowerMessage.match(/\$?(\d+(\.\d{1,2})?)/);
          if (priceMatch) {
            const newPrice = Number.parseFloat(priceMatch[1]);

            setPendingAction({
              ...pendingAction,
              newPrice,
            });

            addBotMessage(
              `Are you sure you want to change the price of "${
                pendingAction.productName
              }" from $${pendingAction.currentPrice!.toFixed(
                2
              )} to $${newPrice.toFixed(2)}?`
            );
            return;
          }
        }
      }

      // Default responses
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        addBotMessage("Hello! How can I assist you with your products today?");
      } else if (lowerMessage.includes("help")) {
        addBotMessage(
          "I can help you manage your products, update prices, and provide market insights. Try asking me to 'update the price of a product' or 'delete a product'."
        );
      } else if (lowerMessage.includes("thank")) {
        addBotMessage(
          "You're welcome! Is there anything else I can help you with?"
        );
      } else if (
        lowerMessage.includes("recommend") ||
        lowerMessage.includes("suggestion")
      ) {
        addBotMessage(
          "Based on current market trends, I recommend reviewing the prices of your electronics products. Some of your products could benefit from a slight price increase as competitor prices have risen by 3% on average."
        );
      } else {
        addBotMessage(
          "I'm not sure how to help with that. You can ask me to update product information, change prices, or delete products from your catalog."
        );
      }
    },
    [userProducts, pendingAction, addBotMessage]
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || isSending) return;

      setIsSending(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentInput = input;
      setInput("");

      // Process message and generate bot response
      try {
        await processUserMessage(currentInput);
      } catch (error) {
        console.error("Error processing message:", error);
        addBotMessage(
          "I'm sorry, there was an error processing your message. Please try again."
        );
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, processUserMessage, addBotMessage]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case "delete":
        await handleDeleteProduct(Number(pendingAction.productId));
        break;

      case "edit":
        addBotMessage(
          `What specific details would you like to update for "${pendingAction.productName}"?`
        );
        return; // Don't reset pending action yet

      case "price":
        if (pendingAction.newPrice) {
          try {
            await ProductService.updateProduct(
              Number(pendingAction.productId),
              {
                price: pendingAction.newPrice,
              }
            );

            addBotMessage(
              `Price for "${
                pendingAction.productName
              }" has been updated from $${pendingAction.currentPrice!.toFixed(
                2
              )} to $${pendingAction.newPrice.toFixed(2)}.`
            );
            toast.success(
              `${
                pendingAction.productName
              } price has been changed to $${pendingAction.newPrice.toFixed(
                2
              )}.`
            );

            // Refresh the products list
            await fetchProducts();
          } catch (error) {
            console.error("Error updating product price:", error);
            addBotMessage(
              `Sorry, there was an error updating the price for "${pendingAction.productName}". Please try again.`
            );
            toast.error("Failed to update product price");
          }
        } else {
          addBotMessage(
            `Please specify the new price for "${
              pendingAction.productName
            }". The current price is $${pendingAction.currentPrice!.toFixed(
              2
            )}.`
          );
          return; // Don't reset pending action yet
        }
        break;
    }

    setPendingAction(null);
  }, [pendingAction, addBotMessage, fetchProducts]);

  // Memoized event handlers
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      setSelectedProduct(product);
      setEditFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        is_active: product.is_active,
        image_url: product.image_url,
      });
      setIsEditDialogOpen(true);
    },
    []
  );

  const handlePriceClick = useCallback(
    (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      setPendingAction({
        type: "price",
        productId: product.id,
        productName: product.name,
        currentPrice: product.price,
      });
      addBotMessage(
        `What price would you like to set for "${
          product.name
        }"? The current price is $${product.price.toFixed(2)}.`
      );
    },
    [addBotMessage]
  );

  const handleEditFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "quantity" ? Number(value) : value,
      }));
    },
    []
  );

  const handleSwitchChange = useCallback((checked: boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      is_active: checked,
    }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);

    try {
      await ProductService.updateProduct(selectedProduct.id, editFormData);
      await fetchProducts();

      toast.success(`${selectedProduct.name} has been updated successfully.`);
      addBotMessage(`"${selectedProduct.name}" has been updated successfully.`);

      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedProduct, editFormData, fetchProducts, addBotMessage]);

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      try {
        await ProductService.deleteProduct(productId);

        // Update local products list
        const updatedProducts = userProducts.filter((p) => p.id !== productId);
        setUserProducts(updatedProducts);

        const productName =
          selectedProduct?.name || pendingAction?.productName || "Product";
        addBotMessage(`"${productName}" has been deleted successfully.`);
        toast.success(`${productName} has been removed from your catalog.`);

        // Reset states
        setSelectedProduct(null);
        setPendingAction(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error(`Error deleting product:`, error);
        addBotMessage(
          "I'm sorry, there was an error deleting the product. Please try again later."
        );
        toast.error("Failed to delete product");
      }
    },
    [userProducts, selectedProduct, pendingAction, addBotMessage]
  );

  // Memoized suggestion handlers
  const suggestionHandlers = useMemo(
    () => ({
      listProducts: () => setInput("List all my products"),
      deleteProduct: () => setInput("Delete a product"),
      editProduct: () => setInput("Edit product information"),
      changePrice: () => setInput("Change product price"),
      marketTrends: () => setInput("Market trends for smartphones"),
      priceRecommendations: () => setInput("Get price recommendations"),
      compareCompetitors: () => setInput("Compare with competitors"),
      whatCanYouDo: () => setInput("What can you help me with?"),
      howToAdd: () => setInput("How do I add a new product?"),
    }),
    []
  );

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Loading Chat...</h2>
          <p className="text-muted-foreground">
            Please wait while we set up your PriceBot assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Chat with PriceBot
                {isTyping && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Bot is typing...</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Ask for help with product management, pricing, and market
                insights
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="flex flex-col p-4 space-y-4">
                  {loadingProducts && messages.length === 1 && (
                    <>
                      <MessageSkeleton />
                      <MessageSkeleton />
                    </>
                  )}
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onPriceClick={handlePriceClick}
                      onEditClick={handleEditClick}
                      onDeleteClick={handleProductClick}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
              {pendingAction && (
                <div className="w-full mb-4 p-2 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center">
                    {pendingAction.type === "delete" && (
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                    )}
                    {pendingAction.type === "edit" && (
                      <Edit className="h-4 w-4 mr-2 text-primary" />
                    )}
                    {pendingAction.type === "price" && (
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span className="text-sm">
                      {pendingAction.type === "delete" &&
                        `Delete "${pendingAction.productName}"`}
                      {pendingAction.type === "edit" &&
                        `Edit "${pendingAction.productName}"`}
                      {pendingAction.type === "price" &&
                        `Change price of "${pendingAction.productName}"`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingAction(null)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="flex w-full gap-2 items-center"
              >
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => debouncedSetInput(e.target.value)}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full"
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
              <CardDescription>
                Try asking the bot about these topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto max-h-[calc(100vh-20rem)]">
              {loadingProducts ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <div className="grid gap-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Product Management</h3>
                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.listProducts}
                      >
                        List all my products
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.deleteProduct}
                      >
                        Delete a product
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.editProduct}
                      >
                        Edit product information
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.changePrice}
                      >
                        Change product price
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Market Insights</h3>
                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.marketTrends}
                      >
                        Market trends for smartphones
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.priceRecommendations}
                      >
                        Get price recommendations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.compareCompetitors}
                      >
                        Compare with competitors
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Help & Support</h3>
                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.whatCanYouDo}
                      >
                        What can you help me with?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full text-left font-normal hover:bg-accent"
                        onClick={suggestionHandlers.howToAdd}
                      >
                        How do I add a new product?
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedProduct(null);
                setPendingAction(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedProduct && handleDeleteProduct(selectedProduct.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.price}
                    onChange={handleEditFormChange}
                    className="pl-7"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={editFormData.quantity}
                  onChange={handleEditFormChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={editFormData.image_url}
                onChange={handleEditFormChange}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editFormData.is_active}
                onCheckedChange={handleSwitchChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active">Active Product</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
