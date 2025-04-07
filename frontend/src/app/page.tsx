import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Bot, DollarSign, LineChart, MessageSquare, ShieldCheck, Store } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Intelligent Price Analysis for Your Products
              </h1>
              <p className="text-muted-foreground md:text-xl">
                PriceBot helps you analyze market prices, manage your products, and optimize your pricing strategy with
                our intelligent assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2">
                <div className="w-full h-full rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Discover how our platform can help you optimize your pricing strategy
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card>
              <CardHeader className="pb-2">
                <LineChart className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>Compare your prices with market trends</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Get detailed insights on how your prices compare to competitors and market averages.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Bot className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Intelligent Assistant</CardTitle>
                <CardDescription>Get recommendations from our AI bot</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Our intelligent bot analyzes market data and provides personalized pricing recommendations.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <MessageSquare className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>Stay updated on market changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Receive alerts when market prices change or when it's time to update your product pricing.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Store className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Easily manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Add, edit, and organize your products with our intuitive management interface.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <DollarSign className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Price Optimization</CardTitle>
                <CardDescription>Set optimal prices for maximum profit</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Our algorithms help you find the sweet spot for pricing to maximize your revenue.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>Your data is protected</CardDescription>
              </CardHeader>
              <CardContent>
                <p>We use industry-standard security measures to keep your business data safe and secure.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Optimize Your Pricing?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of businesses already using our platform
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

