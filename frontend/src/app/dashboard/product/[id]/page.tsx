"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { products, generateSalesHistory, getMarketComparison } from "@/lib/placeholder-data"
import { ArrowLeft, Edit, Star, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import ProductPriceChart from "@/components/product-price-chart"
import ProductRatingChart from "@/components/product-rating-chart"

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [marketComparison, setMarketComparison] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
      return
    }

    // Fetch product data
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const foundProduct = products.find((p) => p.id === params.id)
        if (!foundProduct) {
          toast.error("The requested product could not be found")
          router.push("/dashboard")
          return
        }

        setProduct(foundProduct)
        setSalesHistory(generateSalesHistory(params.id))
        setMarketComparison(getMarketComparison(params.id))
      } catch (error) {
        toast.error("Failed to load product data")
      } finally {
        setPageLoading(false)
      }
    }

    if (!loading) {
      fetchData()
    }
  }, [params.id, router, user, loading])

  if (loading || pageLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load product data</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="text-muted-foreground">The requested product could not be found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate if current price is optimal
  const isOptimal = product.price >= product.minPrice && product.price <= product.maxPrice
  const recommendedPrice = Math.round(((product.minPrice + product.maxPrice) / 2) * 100) / 100

  // Determine market position
  const averageCompetitorPrice = marketComparison.reduce((sum, item) => sum + item.price, 0) / marketComparison.length
  const marketPosition = product.price > averageCompetitorPrice ? "higher" : "lower"
  const priceDifference = Math.abs(((product.price - averageCompetitorPrice) / averageCompetitorPrice) * 100).toFixed(1)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <Button asChild>
            <Link href={`/dashboard/product/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="aspect-square relative">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">{product.category}</Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Price Range</h3>
                  <div className="flex justify-between items-center">
                    <span>${product.minPrice.toFixed(2)}</span>
                    <span>to</span>
                    <span>${product.maxPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Recommended Price</h3>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold">${recommendedPrice.toFixed(2)}</p>
                    {!isOptimal && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Adjustment Needed
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Market Position</h3>
                  <div className="flex items-center">
                    <p>
                      Your price is {priceDifference}% {marketPosition} than average
                    </p>
                    {marketPosition === "higher" ? (
                      <TrendingUp className="h-4 w-4 ml-2 text-destructive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{product.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
              <TabsTrigger value="history">Price History</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price Trends</CardTitle>
                  <CardDescription>Historical price data for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ProductPriceChart data={salesHistory} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Analysis</CardTitle>
                  <CardDescription>Product rating over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ProductRatingChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market Comparison</CardTitle>
                  <CardDescription>How your price compares to competitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Store</span>
                      <span>Price</span>
                      <span>Difference</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-semibold">
                      <span>Your Store</span>
                      <span>${product.price.toFixed(2)}</span>
                      <span>-</span>
                    </div>

                    <Separator />

                    {marketComparison.map((competitor, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center">
                          <span>{competitor.storeName}</span>
                          <span>${competitor.price.toFixed(2)}</span>
                          <span
                            className={competitor.difference.startsWith("+") ? "text-destructive" : "text-green-500"}
                          >
                            {competitor.difference}
                          </span>
                        </div>
                        {index < marketComparison.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Recommendation</CardTitle>
                  <CardDescription>AI-powered price optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Bot Recommendation</h3>
                      <p>
                        Based on market analysis and competitor pricing, we recommend setting your price to{" "}
                        <strong>${recommendedPrice.toFixed(2)}</strong>. This price point optimizes your competitive
                        position while maintaining profitability.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Price</p>
                        <p className="font-medium">${recommendedPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Potential Increase</p>
                        <p className="font-medium text-green-500">
                          {(((recommendedPrice - product.price) / product.price) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => toast.success(`Price updated to $${recommendedPrice.toFixed(2)}`)}
                    >
                      Apply Recommended Price
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>Detailed history of price changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Date</span>
                      <span>Price</span>
                      <span>Change</span>
                    </div>

                    <Separator />

                    {salesHistory.slice(0, 10).map((record, index) => {
                      const prevPrice = index < salesHistory.length - 1 ? salesHistory[index + 1].price : record.price
                      const change = record.price - prevPrice
                      const changePercent = (change / prevPrice) * 100

                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center">
                            <span>{record.date}</span>
                            <span>${record.price.toFixed(2)}</span>
                            <span className={change >= 0 ? "text-green-500" : "text-destructive"}>
                              {change >= 0 ? "+" : ""}
                              {changePercent.toFixed(2)}%
                            </span>
                          </div>
                          {index < 9 && <Separator className="my-4" />}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

