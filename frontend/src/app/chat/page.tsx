"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Send, Bot, User, X, Edit, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ProductService, { type Product } from "@/lib/product-service"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Message = {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
  products?: Product[]
}

type ProductAction = {
  type: "edit" | "delete" | "price"
  productId: string | number
  productName: string
  newPrice?: number
  minPrice?: number
  maxPrice?: number
  currentPrice?: number
}

export default function ChatPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm your PriceBot assistant. I can help you manage your products, analyze prices, and provide recommendations. What would you like to do today?",
      timestamp: new Date(),
    },
  ])
  const [pendingAction, setPendingAction] = useState<ProductAction | null>(null)
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Fetch user's products
    const fetchProducts = async () => {
      if (!user) return

      try {
        setLoadingProducts(true)
        const products = await ProductService.getProducts()
        setUserProducts(products)
        setLoadingProducts(false)
      } catch (error) {
        console.error("Error fetching products:", error)
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [user])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Process message and generate bot response
    setTimeout(() => {
      processUserMessage(input)
    }, 500)
  }

  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check for product deletion intent
    if (lowerMessage.includes("delete") && (lowerMessage.includes("product") || lowerMessage.includes("item"))) {
      if (userProducts.length === 0) {
        addBotMessage("You don't have any products to delete. Would you like to add a product first?")
        return
      }

      // Show list of products to delete
      addBotMessage("Which product would you like to delete? Here are your products:", userProducts)
      return
    }

    // Handle product selection for deletion
    if (pendingAction?.type === "delete") {
      const productId = pendingAction.productId
      handleDeleteProduct(Number(productId))
      return
    }

    // Check for product actions
    if (lowerMessage.includes("delete") || lowerMessage.includes("remove")) {
      const productMatches = userProducts.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

      if (productMatches.length > 0) {
        const product = productMatches[0]
        setPendingAction({
          type: "delete",
          productId: product.id,
          productName: product.name,
        })

        addBotMessage(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)
        return
      }
    }

    if (lowerMessage.includes("edit") || lowerMessage.includes("update")) {
      const productMatches = userProducts.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

      if (productMatches.length > 0) {
        const product = productMatches[0]
        setPendingAction({
          type: "edit",
          productId: product.id,
          productName: product.name,
        })

        addBotMessage(
          `What would you like to update for "${product.name}"? You can change the price, description, or other details.`,
        )
        return
      }
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      const productMatches = userProducts.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

      if (productMatches.length > 0) {
        const product = productMatches[0]

        // Try to extract price from message
        const priceMatch = lowerMessage.match(/\$?(\d+(\.\d{1,2})?)/)
        if (priceMatch) {
          const newPrice = Number.parseFloat(priceMatch[1])

          setPendingAction({
            type: "price",
            productId: product.id,
            productName: product.name,
            newPrice,
            currentPrice: product.price,
          })

          addBotMessage(
            `Are you sure you want to change the price of "${product.name}" from $${product.price.toFixed(2)} to $${newPrice.toFixed(2)}?`,
          )
          return
        } else {
          addBotMessage(
            `What price would you like to set for "${product.name}"? The current price is $${product.price.toFixed(2)}.`,
          )
          setPendingAction({
            type: "price",
            productId: product.id,
            productName: product.name,
            currentPrice: product.price,
          })
          return
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
        handleConfirmAction()
        return
      }

      if (lowerMessage.includes("no") || lowerMessage.includes("cancel") || lowerMessage.includes("abort")) {
        addBotMessage(`Action cancelled. Is there anything else I can help you with?`)
        setPendingAction(null)
        return
      }

      // If there's a pending price action and the user entered a number
      if (pendingAction.type === "price") {
        const priceMatch = lowerMessage.match(/\$?(\d+(\.\d{1,2})?)/)
        if (priceMatch) {
          const newPrice = Number.parseFloat(priceMatch[1])

          setPendingAction({
            ...pendingAction,
            newPrice,
          })

          addBotMessage(
            `Are you sure you want to change the price of "${pendingAction.productName}" from $${pendingAction.currentPrice!.toFixed(2)} to $${newPrice.toFixed(2)}?`,
          )
          return
        }
      }
    }

    // Default responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      addBotMessage("Hello! How can I assist you with your products today?")
    } else if (lowerMessage.includes("help")) {
      addBotMessage(
        "I can help you manage your products, update prices, and provide market insights. Try asking me to 'update the price of a product' or 'delete a product'.",
      )
    } else if (lowerMessage.includes("thank")) {
      addBotMessage("You're welcome! Is there anything else I can help you with?")
    } else if (lowerMessage.includes("recommend") || lowerMessage.includes("suggestion")) {
      addBotMessage(
        "Based on current market trends, I recommend reviewing the prices of your electronics products. Some of your products could benefit from a slight price increase as competitor prices have risen by 3% on average.",
      )
    } else if (lowerMessage.includes("list") && lowerMessage.includes("product")) {
      if (userProducts.length === 0) {
        addBotMessage("You don't have any products yet. Would you like to add a product?")
      } else {
        addBotMessage("Here are your products:", userProducts)
      }
    } else {
      addBotMessage(
        "I'm not sure how to help with that. You can ask me to update product information, change prices, or delete products from your catalog.",
      )
    }
  }

  const handleConfirmAction = () => {
    if (!pendingAction) return

    switch (pendingAction.type) {
      case "delete":
        handleDeleteProduct(Number(pendingAction.productId))
        break

      case "edit":
        addBotMessage(`What specific details would you like to update for "${pendingAction.productName}"?`)
        return // Don't reset pending action yet

      case "price":
        if (pendingAction.newPrice) {
          // In a real app, you would update the product price here
          addBotMessage(
            `Price for "${pendingAction.productName}" has been updated from $${pendingAction.currentPrice!.toFixed(2)} to $${pendingAction.newPrice.toFixed(2)}.`,
          )
          toast.success(`${pendingAction.productName} price has been changed to $${pendingAction.newPrice.toFixed(2)}.`)
        } else {
          addBotMessage(
            `Please specify the new price for "${pendingAction.productName}". The current price is $${pendingAction.currentPrice!.toFixed(2)}.`,
          )
          return // Don't reset pending action yet
        }
        break
    }

    setPendingAction(null)
  }

  const addBotMessage = (text: string, productsList?: Product[]) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text,
      timestamp: new Date(),
      products: productsList,
    }

    setMessages((prev) => [...prev, botMessage])
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    try {
      await ProductService.deleteProduct(productId)

      // Update local products list
      const updatedProducts = userProducts.filter((p) => p.id !== productId)
      setUserProducts(updatedProducts)

      const productName = selectedProduct?.name || pendingAction?.productName || "Product"
      addBotMessage(`"${productName}" has been deleted successfully.`)
      toast.success(`${productName} has been removed from your catalog.`)

      // Reset states
      setSelectedProduct(null)
      setPendingAction(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error(`Error deleting product:`, error)
      addBotMessage("I'm sorry, there was an error deleting the product. Please try again later.")
      toast.error("Failed to delete product")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load the chat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Chat with PriceBot</CardTitle>
              <CardDescription>Ask for help with product management, pricing, and market insights</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="flex flex-col p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
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
                            message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>

                          {/* Product list for deletion */}
                          {message.products && message.products.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.products.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center gap-2 p-2 rounded-md bg-background hover:bg-accent cursor-pointer transition-colors"
                                  onClick={() => handleProductClick(product)}
                                >
                                  <div className="h-10 w-10 relative rounded-md overflow-hidden">
                                    <Image
                                      src={
                                        product.image_url ||
                                        `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                                      }
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      ${product.price.toFixed(2)} - Qty: {product.quantity}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
              {pendingAction && (
                <div className="w-full mb-4 p-2 rounded-lg bg-muted flex items-center justify-between">
                  <div className="flex items-center">
                    {pendingAction.type === "delete" && <Trash2 className="h-4 w-4 mr-2 text-destructive" />}
                    {pendingAction.type === "edit" && <Edit className="h-4 w-4 mr-2 text-primary" />}
                    {pendingAction.type === "price" && <Edit className="h-4 w-4 mr-2 text-primary" />}
                    <span className="text-sm">
                      {pendingAction.type === "delete" && `Delete "${pendingAction.productName}"`}
                      {pendingAction.type === "edit" && `Edit "${pendingAction.productName}"`}
                      {pendingAction.type === "price" && `Change price of "${pendingAction.productName}"`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setPendingAction(null)} className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div className="hidden md:block">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
              <CardDescription>Try asking the bot about these topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Product Management</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("List all my products")}
                  >
                    List all my products
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("Delete a product")}
                  >
                    Delete a product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("Update product price")}
                  >
                    Update product price
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Market Insights</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("Market trends for smartphones")}
                  >
                    Market trends for smartphones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("Get price recommendations")}
                  >
                    Get price recommendations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start w-full text-left font-normal"
                    onClick={() => setInput("Compare with competitors")}
                  >
                    Compare with competitors
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedProduct(null)
                setPendingAction(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProduct && handleDeleteProduct(selectedProduct.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
