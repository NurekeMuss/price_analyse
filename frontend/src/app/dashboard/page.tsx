"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Search, Plus, Bell, ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ProductService, { type Product } from "@/lib/product-service"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [totalFeaturedProducts, setTotalFeaturedProducts] = useState(0)
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Price Alert",
      message: "Market price for 'Smartphone X Pro' has decreased by 5%",
      read: false,
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "Recommendation",
      message: "Consider updating the price of 'Wireless Headphones'",
      read: false,
      time: "1 day ago",
    },
  ])

  // Update the pagination state to default to 10 items per page
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Fetch products with pagination
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const result = await ProductService.getProductsWithPagination(currentPage, itemsPerPage)
        setProducts(result.data)
        setFilteredProducts(result.data)
        setTotalProducts(result.total)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
        setLoading(false)
      }
    }

    // Fetch featured products of the day
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true)
        const result = await ProductService.getProductsOfTheDay()
        setFeaturedProducts(result.products.slice(0, 3)) // Show only top 3 featured products
        setTotalFeaturedProducts(result.count) // Store the total count
        setLoadingFeatured(false)
      } catch (error) {
        console.error("Error fetching featured products:", error)
        setLoadingFeatured(false)
      }
    }

    if (user) {
      fetchProducts()
      fetchFeaturedProducts()
    }
  }, [user, authLoading, router, currentPage, itemsPerPage])

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const handleViewAllFeatured = () => {
    router.push("/dashboard/featured-products")
  }

  if (authLoading || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.first_name || user.email}! Manage your products and analyze prices.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </div>
          <Button asChild>
            <Link href="/dashboard/add-product">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Featured Products Section */}
      {loadingFeatured ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Featured Products of the Day</CardTitle>
            <CardDescription>Products trending today based on market analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : featuredProducts.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Featured Products of the Day</CardTitle>
                <CardDescription>Products trending today based on market analysis</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing 3 of {totalFeaturedProducts} featured products
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="text-sm text-muted-foreground">
                          Added: {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={handleViewAllFeatured} className="w-full sm:w-auto">
              View All Featured Products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage and analyze your product catalog</CardDescription>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
                <div className="flex items-center gap-2">
                  <label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">
                    Items per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
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
                              <div className="text-sm text-muted-foreground">
                                Added: {new Date(product.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No products found</p>
                      <Button asChild className="mt-4">
                        <Link href="/dashboard/add-product">
                          <Plus className="mr-2 h-4 w-4" /> Add Your First Product
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {totalProducts > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Show all page numbers if there are 10 or fewer pages */}
                    {totalPages <= 10 && (
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Show first page, current page neighborhood, and last page if more than 10 pages */}
                    {totalPages > 10 && (
                      <div className="flex items-center space-x-1">
                        {/* First page */}
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>

                        {/* Ellipsis if current page > 3 */}
                        {currentPage > 3 && <span className="mx-1">...</span>}

                        {/* Pages around current page */}
                        {Array.from({ length: 5 }, (_, i) => {
                          const pageNum = Math.max(2, currentPage - 2) + i
                          // Don't render if page number exceeds total pages or is less than 2
                          if (pageNum >= totalPages || pageNum < 2) return null
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}

                        {/* Ellipsis if current page < totalPages - 2 */}
                        {currentPage < totalPages - 2 && <span className="mx-1">...</span>}

                        {/* Last page */}
                        {totalPages > 1 && (
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated with alerts and recommendations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${notification.read ? "bg-background" : "bg-muted/50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
