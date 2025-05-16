"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Edit, Trash2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import ProductService, { type Product } from "@/lib/product-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch product data
    const fetchData = async () => {
      try {
        const productData = await ProductService.getProduct(productId)
        setProduct(productData)

        // Fetch recommended price
        try {
          setLoadingRecommendation(true)
          const price = await ProductService.getRecommendedPrice(productId)
          setRecommendedPrice(price)
        } catch (error) {
          console.error("Error fetching recommended price:", error)
          // Don't show error toast for this as it's not critical
        } finally {
          setLoadingRecommendation(false)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product data")
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, router, user])

  const handleDeleteProduct = async () => {
    if (!product) return

    try {
      await ProductService.deleteProduct(product.id)
      toast.success("Product deleted successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const handleUpdatePrice = async (newPrice: number) => {
    if (!product) return

    try {
      await ProductService.updateProduct(product.id, { price: newPrice })
      toast.success("Price updated successfully")

      // Refresh product data
      const updatedProduct = await ProductService.getProduct(product.id)
      setProduct(updatedProduct)
    } catch (error) {
      console.error("Error updating price:", error)
      toast.error("Failed to update price")
    }
  }

  if (loading || !product) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load product data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/product/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Product
              </Link>
            </Button>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product "{product.name}" from your
                    catalog.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProduct}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="aspect-square relative">
              <Image
                src={
                  product.image_url.startsWith("http")
                    ? product.image_url
                    : `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`
                }
                alt={product.name}
                fill
                className="object-cover rounded-t-lg"
                unoptimized={!product.image_url.includes("placeholder.svg")}
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">Quantity: {product.quantity}</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </div>

                {recommendedPrice !== null && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> Recommended Price
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xl font-medium">${recommendedPrice.toFixed(2)}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdatePrice(recommendedPrice)}
                          className="text-xs"
                        >
                          <DollarSign className="h-3 w-3 mr-1" /> Apply
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recommendedPrice > product.price
                          ? `${(((recommendedPrice - product.price) / product.price) * 100).toFixed(1)}% increase recommended`
                          : `${(((product.price - recommendedPrice) / product.price) * 100).toFixed(1)}% decrease recommended`}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p>{new Date(product.created_at).toLocaleDateString()}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full ${product.is_active ? "bg-green-500" : "bg-red-500"} mr-2`}
                    ></div>
                    <p>{product.is_active ? "Active" : "Inactive"}</p>
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
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Detailed information about this product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Product Name</h3>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <p className="font-medium">{product.is_active ? "Active" : "Inactive"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                      <p className="font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{product.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/product/${product.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Product
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Track and manage product inventory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Stock</h3>
                      <p className="text-2xl font-bold">{product.quantity} units</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${product.quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>

                  <Separator />

                  {product.quantity <= 5 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Low Stock Alert</h4>
                        <p className="text-sm text-amber-700">
                          This product is running low on inventory. Consider restocking soon.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Inventory History</h3>
                    <p className="text-sm text-muted-foreground">
                      Inventory tracking is not available in the current version. This feature will be available in a
                      future update.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={`/dashboard/product/${product.id}/edit`}>Update Inventory</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
