"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductService, { type Product, type UpdateProductData } from "@/lib/product-service"
import { useAuth } from "@/lib/auth-context"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState<UpdateProductData>({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    is_active: true,
    image_url: "",
  })

  // Fetch product data
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProduct = async () => {
      try {
        const productData = await ProductService.getProduct(Number.parseInt(params.id))
        setProduct(productData)
        setFormData({
          name: productData.name,
          description: productData.description,
          quantity: productData.quantity,
          price: productData.price,
          is_active: productData.is_active,
          image_url: productData.image_url,
        })
        setLoadingProduct(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product data")
        router.push("/dashboard")
      }
    }

    fetchProduct()
  }, [params.id, router, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description) {
      toast.error("Name and description are required")
      return
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (formData.quantity < 0) {
      toast.error("Quantity cannot be negative")
      return
    }

    setLoading(true)

    try {
      await ProductService.updateProduct(Number.parseInt(params.id), formData)
      toast.success("Product updated successfully")
      router.push(`/dashboard/product/${params.id}`)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct || !product) {
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
          <Link href={`/dashboard/product/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update the details of {product.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Update the details of your product</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Product Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to an image. Leave empty to use a placeholder.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_active">Active Product</Label>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/product/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" form="product-form" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
              <CardDescription>Manage product visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? "Product is visible to customers" : "Product is hidden from customers"}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${formData.is_active ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
