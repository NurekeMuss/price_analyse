"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { products } from "@/lib/placeholder-data"
import { Send, Bot, User, X, Edit, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
}

type ProductAction = {
  type: "edit" | "delete" | "price"
  productId: string
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

    // Check for product actions
    if (lowerMessage.includes("delete") || lowerMessage.includes("remove")) {
      const productMatches = products.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

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
      const productMatches = products.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

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
      const productMatches = products.filter((p) => lowerMessage.includes(p.name.toLowerCase()))

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
            minPrice: product.minPrice,
            maxPrice: product.maxPrice,
            currentPrice: product.price,
          })

          if (newPrice < product.minPrice || newPrice > product.maxPrice) {
            addBotMessage(
              `Warning: The price $${newPrice.toFixed(2)} for "${product.name}" is outside the recommended range ($${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}). Do you still want to proceed?`,
            )
          } else {
            addBotMessage(
              `Are you sure you want to change the price of "${product.name}" from $${product.price.toFixed(2)} to $${newPrice.toFixed(2)}?`,
            )
          }
          return
        } else {
          addBotMessage(
            `What price would you like to set for "${product.name}"? The current price is $${product.price.toFixed(2)}, and the recommended range is $${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}.`,
          )
          setPendingAction({
            type: "price",
            productId: product.id,
            productName: product.name,
            currentPrice: product.price,
            minPrice: product.minPrice,
            maxPrice: product.maxPrice,
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

          if (newPrice < pendingAction.minPrice! || newPrice > pendingAction.maxPrice!) {
            addBotMessage(
              `Warning: The price $${newPrice.toFixed(2)} for "${pendingAction.productName}" is outside the recommended range ($${pendingAction.minPrice!.toFixed(2)} - $${pendingAction.maxPrice!.toFixed(2)}). Do you still want to proceed?`,
            )
          } else {
            addBotMessage(
              `Are you sure you want to change the price of "${pendingAction.productName}" from $${pendingAction.currentPrice!.toFixed(2)} to $${newPrice.toFixed(2)}?`,
            )
          }
          return
        }
      }
    }

    // Default responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      addBotMessage("Hello! How can I assist you with your products today?")
    } else if (lowerMessage.includes("help")) {
      addBotMessage(
        "I can help you manage your products, update prices, and provide market insights. Try asking me to 'update the price of Smartphone X Pro' or 'show me market trends for Wireless Headphones'.",
      )
    } else if (lowerMessage.includes("thank")) {
      addBotMessage("You're welcome! Is there anything else I can help you with?")
    } else if (lowerMessage.includes("recommend") || lowerMessage.includes("suggestion")) {
      addBotMessage(
        "Based on current market trends, I recommend reviewing the prices of your electronics products. The 'Smartphone X Pro' could benefit from a slight price increase as competitor prices have risen by 3% on average.",
      )
    } else {
      addBotMessage(
        "I'm not sure how to help with that. You can ask me to update product information, change prices, or provide market insights for specific products.",
      )
    }
  }

  const handleConfirmAction = () => {
    if (!pendingAction) return

    switch (pendingAction.type) {
      case "delete":
        addBotMessage(`Product "${pendingAction.productName}" has been deleted successfully.`)
        toast.success(`${pendingAction.productName} has been removed from your catalog.`)
        break

      case "edit":
        addBotMessage(`What specific details would you like to update for "${pendingAction.productName}"?`)
        return // Don't reset pending action yet

      case "price":
        if (pendingAction.newPrice) {
          const isOutsideRange =
            pendingAction.newPrice < pendingAction.minPrice! || pendingAction.newPrice > pendingAction.maxPrice!

          addBotMessage(
            `Price for "${pendingAction.productName}" has been updated from $${pendingAction.currentPrice!.toFixed(2)} to $${pendingAction.newPrice.toFixed(2)}.${isOutsideRange ? " Note that this price is outside the recommended range." : ""}`,
          )

          if (isOutsideRange) {
            toast.error(
              `${pendingAction.productName} price has been changed to $${pendingAction.newPrice.toFixed(2)}, which is outside the recommended range.`,
            )
          } else {
            toast.success(
              `${pendingAction.productName} price has been changed to $${pendingAction.newPrice.toFixed(2)}.`,
            )
          }
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

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
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
    <div className="container py-8">
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
                          <p>{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
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
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Product Management</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Show me all my products")}
                  >
                    Show me all my products
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Update the price of Smartphone X Pro to $849.99")}
                  >
                    Update the price of Smartphone X Pro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Delete Wireless Headphones from my catalog")}
                  >
                    Delete a product
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Market Insights</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("What's the market trend for smartphones?")}
                  >
                    Market trends for smartphones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Recommend optimal prices for my products")}
                  >
                    Get price recommendations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Compare my prices with competitors")}
                  >
                    Compare with competitors
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Help & Support</h3>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("What can you help me with?")}
                  >
                    What can you help me with?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("How do I add a new product?")}
                  >
                    How do I add a new product?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => setInput("Show me pricing best practices")}
                  >
                    Show me pricing best practices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

