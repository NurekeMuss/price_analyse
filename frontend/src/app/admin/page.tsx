"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { platformAnalytics } from "@/lib/placeholder-data"
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import UserService, { type User, type CreateUserData, type UpdateUserData } from "@/lib/user-service"
import ProductService, { type Product, type CreateProductData, type UpdateProductData } from "@/lib/product-service"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  // User state
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Product state
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Loading state
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Form state
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: "",
    first_name: "",
    last_name: "",
    password_hash: "",
    role: "user",
    is_blocked: false,
  })

  const [editUser, setEditUser] = useState<UpdateUserData>({
    email: "",
    first_name: "",
    last_name: "",
    role: "user",
    is_blocked: false,
  })

  const [newProduct, setNewProduct] = useState<CreateProductData>({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    is_active: true,
    image_url: "",
  })

  const [editProduct, setEditProduct] = useState<UpdateProductData>({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    is_active: true,
    image_url: "",
  })

  // Chart data
  const userGrowthData = [
    { name: "Jan", users: platformAnalytics.userGrowth[0] },
    { name: "Feb", users: platformAnalytics.userGrowth[1] },
    { name: "Mar", users: platformAnalytics.userGrowth[2] },
    { name: "Apr", users: platformAnalytics.userGrowth[3] },
    { name: "May", users: platformAnalytics.userGrowth[4] },
    { name: "Jun", users: platformAnalytics.userGrowth[5] },
  ]

  const productActivityData = [
    { name: "Jan", activity: platformAnalytics.productActivity[0] },
    { name: "Feb", activity: platformAnalytics.productActivity[1] },
    { name: "Mar", activity: platformAnalytics.productActivity[2] },
    { name: "Apr", activity: platformAnalytics.productActivity[3] },
    { name: "May", activity: platformAnalytics.productActivity[4] },
    { name: "Jun", activity: platformAnalytics.productActivity[5] },
  ]

  const botInteractionsData = [
    { name: "Jan", interactions: platformAnalytics.botInteractions[0] },
    { name: "Feb", interactions: platformAnalytics.botInteractions[1] },
    { name: "Mar", interactions: platformAnalytics.botInteractions[2] },
    { name: "Apr", interactions: platformAnalytics.botInteractions[3] },
    { name: "May", interactions: platformAnalytics.botInteractions[4] },
    { name: "Jun", interactions: platformAnalytics.botInteractions[5] },
  ]

  const userDistributionData = [
    { name: "Active Users", value: platformAnalytics.activeUsers },
    { name: "Inactive Users", value: platformAnalytics.totalUsers - platformAnalytics.activeUsers },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (user && !isAdmin()) {
      toast.error("You don't have permission to access the admin panel")
      router.push("/dashboard")
      return
    }

    // Fetch users and products
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const userData = await UserService.getUsers()
        setUsers(userData)
        setFilteredUsers(userData)

        // Fetch products
        const productData = await ProductService.getProducts()
        setProducts(productData)
        setFilteredProducts(productData)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, router, isAdmin])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  // Filter products based on search query
  useEffect(() => {
    if (productSearchQuery) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(productSearchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [productSearchQuery, products])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  // User management functions
  const handleAddUser = async () => {
    // Validate form
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password_hash) {
      toast.error("All fields are required")
      return
    }

    setActionLoading(true)

    try {
      await UserService.createUser(newUser)
      toast.success(`${newUser.first_name} ${newUser.last_name} has been added successfully`)

      // Refresh user list
      const updatedUsers = await UserService.getUsers()
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)

      // Reset form and close dialog
      setNewUser({
        email: "",
        first_name: "",
        last_name: "",
        password_hash: "",
        role: "user",
        is_blocked: false,
      })
      setIsAddUserOpen(false)
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Failed to add user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_blocked: user.is_blocked,
    })
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)

    try {
      await UserService.updateUser(selectedUser.id, editUser)
      toast.success(`User has been updated successfully`)

      // Refresh user list
      const updatedUsers = await UserService.getUsers()
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)

      setIsEditUserOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteUserDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)

    try {
      await UserService.deleteUser(selectedUser.id)
      toast.success(`User has been deleted successfully`)

      // Refresh user list
      const updatedUsers = await UserService.getUsers()
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)

      setIsDeleteUserDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    } finally {
      setActionLoading(false)
    }
  }

  // Product management functions
  const handleAddProduct = async () => {
    // Validate form
    if (!newProduct.name || !newProduct.description) {
      toast.error("Name and description are required")
      return
    }

    if (newProduct.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (newProduct.quantity < 0) {
      toast.error("Quantity cannot be negative")
      return
    }

    // If no image URL was provided, use a placeholder
    if (!newProduct.image_url) {
      setNewProduct((prev) => ({
        ...prev,
        image_url: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(newProduct.name)}`,
      }))
    }

    setActionLoading(true)

    try {
      await ProductService.createProduct(newProduct)
      toast.success(`${newProduct.name} has been added successfully`)

      // Refresh product list
      const updatedProducts = await ProductService.getProducts()
      setProducts(updatedProducts)
      setFilteredProducts(updatedProducts)

      // Reset form and close dialog
      setNewProduct({
        name: "",
        description: "",
        quantity: 0,
        price: 0,
        is_active: true,
        image_url: "",
      })
      setIsAddProductOpen(false)
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditProduct({
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      price: product.price,
      is_active: product.is_active,
      image_url: product.image_url,
    })
    setIsEditProductOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return

    setActionLoading(true)

    try {
      await ProductService.updateProduct(selectedProduct.id, editProduct)
      toast.success(`Product has been updated successfully`)

      // Refresh product list
      const updatedProducts = await ProductService.getProducts()
      setProducts(updatedProducts)
      setFilteredProducts(updatedProducts)

      setIsEditProductOpen(false)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteProductDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    setActionLoading(true)

    try {
      await ProductService.deleteProduct(selectedProduct.id)
      toast.success(`Product has been deleted successfully`)

      // Refresh product list
      const updatedProducts = await ProductService.getProducts()
      setProducts(updatedProducts)
      setFilteredProducts(updatedProducts)

      setIsDeleteProductDialogOpen(false)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load the admin panel</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin()) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the admin panel</p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, view analytics, and control platform settings</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{platformAnalytics.userGrowth[platformAnalytics.userGrowth.length - 1]} new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter((user) => !user.is_blocked).length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((users.filter((user) => !user.is_blocked).length / users.length) * 100)}% of total users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter((p) => p.is_active).length} active products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.reduce((total, product) => total + product.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Items across all products</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="New Users" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Product Activity</CardTitle>
                <CardDescription>Product updates and additions</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activity" name="Product Activity" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bot Interactions</CardTitle>
                <CardDescription>User interactions with the PriceBot</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={botInteractionsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="interactions"
                      name="Bot Interactions"
                      stroke="#0ea5e9"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by activity status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts</CardDescription>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account with the specified details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={newUser.first_name}
                            onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={newUser.last_name}
                            onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password_hash}
                          onChange={(e) => setNewUser({ ...newUser, password_hash: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: "user" | "admin") => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_blocked"
                          checked={newUser.is_blocked}
                          onCheckedChange={(checked) => setNewUser({ ...newUser, is_blocked: checked })}
                        />
                        <Label htmlFor="is_blocked">Block User</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)} disabled={actionLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser} disabled={actionLoading}>
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                          </>
                        ) : (
                          "Add User"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <form onSubmit={handleSearch} className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.is_blocked ? (
                            <span className="flex items-center text-destructive">
                              <XCircle className="h-4 w-4 mr-1" /> Blocked
                            </span>
                          ) : (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" /> Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUserClick(user)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user account details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_first_name">First Name</Label>
                    <Input
                      id="edit_first_name"
                      value={editUser.first_name}
                      onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_last_name">Last Name</Label>
                    <Input
                      id="edit_last_name"
                      value={editUser.last_name}
                      onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value: "user" | "admin") => setEditUser({ ...editUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_blocked"
                    checked={editUser.is_blocked}
                    onCheckedChange={(checked) => setEditUser({ ...editUser, is_blocked: checked })}
                  />
                  <Label htmlFor="edit_is_blocked">{editUser.is_blocked ? "User is blocked" : "User is active"}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account
                  {selectedUser && ` for ${selectedUser.first_name} ${selectedUser.last_name}`}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-destructive text-destructive-foreground"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>View and manage products across all users</CardDescription>
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>Create a new product in the catalog</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              step="0.01"
                              className="pl-7"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            step="1"
                            value={newProduct.quantity}
                            onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                          id="image_url"
                          value={newProduct.image_url}
                          onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a direct URL to an image. Leave empty to use a placeholder.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={newProduct.is_active}
                          onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Active Product</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProductOpen(false)} disabled={actionLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct} disabled={actionLoading}>
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                          </>
                        ) : (
                          "Add Product"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <form onSubmit={handleProductSearch} className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-md overflow-hidden relative">
                                {product.image_url ? (
                                  <Image
                                    src={
                                      product.image_url.startsWith("http")
                                        ? product.image_url
                                        : `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(product.name)}`
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized={!product.image_url.includes("placeholder.svg")}
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                              {product.price.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground mr-1" />
                              {product.quantity}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProductClick(product)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Product Dialog */}
          <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update product details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Product Name</Label>
                  <Input
                    id="edit_name"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_price">Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="edit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        value={editProduct.price}
                        onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_quantity">Quantity</Label>
                    <Input
                      id="edit_quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={editProduct.quantity}
                      onChange={(e) => setEditProduct({ ...editProduct, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_image_url">Image URL</Label>
                  <Input
                    id="edit_image_url"
                    value={editProduct.image_url}
                    onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to an image. Leave empty to use a placeholder.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_active"
                    checked={editProduct.is_active}
                    onCheckedChange={(checked) => setEditProduct({ ...editProduct, is_active: checked })}
                  />
                  <Label htmlFor="edit_is_active">
                    {editProduct.is_active ? "Product is active" : "Product is inactive"}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditProductOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct} disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Product Dialog */}
          <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  {selectedProduct && ` "${selectedProduct.name}"`}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProduct}
                  className="bg-destructive text-destructive-foreground"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
