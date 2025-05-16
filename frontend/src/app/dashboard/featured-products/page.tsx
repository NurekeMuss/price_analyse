"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import ProductService, { type Product } from "@/lib/product-service"
import { useAuth } from "@/lib/auth-context"

export default function FeaturedProductsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const result = await ProductService.getProductsOfTheDay()
        setFeaturedProducts(result.products)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching featured products:", error)
        setLoading(false)
      }
    }

    if (user) {
      fetchFeaturedProducts()
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load featured products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Featured Products of the Day</h1>
          <p className="text-muted-foreground">
            Products trending today based on market analysis and customer engagement
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Link href={`/dashboard/product/${product.id}`} key={product.id}>
              <Card className="overflow-hidden h-full transition-all hover:border-primary">
                <div className="aspect-video relative">
                  {product.image_url ? (
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized={!product.image_url.includes("placeholder.svg")}
                    />
                  ) : (
                    <Image
                      src={`/abstract-geometric-shapes.png?height=200&width=200&query=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Qty: {product.quantity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <span className="font-medium">{product.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Views: {product.views}</span>
                      <span>Purchases: {product.purchases}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
