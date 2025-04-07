// Products
export const products = [
    {
      id: "1",
      name: "Smartphone X Pro",
      category: "Electronics",
      storeId: "1",
      price: 799.99,
      minPrice: 749.99,
      maxPrice: 849.99,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=200",
      description: "Latest flagship smartphone with advanced camera system and powerful processor.",
    },
    {
      id: "2",
      name: "Wireless Headphones",
      category: "Electronics",
      storeId: "1",
      price: 129.99,
      minPrice: 99.99,
      maxPrice: 149.99,
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200",
      description: "Premium noise-cancelling wireless headphones with long battery life.",
    },
    {
      id: "3",
      name: "Smart Watch Series 5",
      category: "Electronics",
      storeId: "1",
      price: 299.99,
      minPrice: 279.99,
      maxPrice: 329.99,
      rating: 4.3,
      image: "/placeholder.svg?height=200&width=200",
      description: "Advanced smartwatch with health monitoring and GPS features.",
    },
    {
      id: "4",
      name: 'Laptop Pro 15"',
      category: "Electronics",
      storeId: "2",
      price: 1299.99,
      minPrice: 1199.99,
      maxPrice: 1399.99,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=200",
      description: "High-performance laptop with retina display and fast processor.",
    },
    {
      id: "5",
      name: "Wireless Charging Pad",
      category: "Electronics",
      storeId: "2",
      price: 39.99,
      minPrice: 29.99,
      maxPrice: 49.99,
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=200",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    },
    {
      id: "6",
      name: "Smart Home Speaker",
      category: "Electronics",
      storeId: "3",
      price: 89.99,
      minPrice: 79.99,
      maxPrice: 99.99,
      rating: 4.4,
      image: "/placeholder.svg?height=200&width=200",
      description: "Voice-controlled smart speaker with premium sound quality.",
    },
  ]
  
  // Stores
  export const stores = [
    {
      id: "1",
      name: "TechHub",
      userId: "1",
    },
    {
      id: "2",
      name: "ElectroWorld",
      userId: "1",
    },
    {
      id: "3",
      name: "GadgetZone",
      userId: "2",
    },
  ]
  
  // Sales History (last 6 months)
  export const generateSalesHistory = (productId: string) => {
    const today = new Date()
    const history = []
  
    for (let i = 0; i < 180; i++) {
      const date = new Date()
      date.setDate(today.getDate() - i)
  
      // Base price for the product
      const basePrice = products.find((p) => p.id === productId)?.price || 100
  
      // Add some random variation
      const randomFactor = 0.9 + Math.random() * 0.2 // Between 0.9 and 1.1
      const price = Math.round(basePrice * randomFactor * 100) / 100
  
      history.push({
        id: `${productId}-${i}`,
        productId,
        date: date.toISOString().split("T")[0],
        price,
      })
    }
  
    return history.reverse()
  }
  
  // Market comparison data
  export const getMarketComparison = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return []
  
    const basePrice = product.price
  
    return [
      {
        storeName: "CompetitorA",
        price: Math.round(basePrice * 1.05 * 100) / 100,
        difference: "+5%",
      },
      {
        storeName: "CompetitorB",
        price: Math.round(basePrice * 0.95 * 100) / 100,
        difference: "-5%",
      },
      {
        storeName: "CompetitorC",
        price: Math.round(basePrice * 1.02 * 100) / 100,
        difference: "+2%",
      },
      {
        storeName: "CompetitorD",
        price: Math.round(basePrice * 0.98 * 100) / 100,
        difference: "-2%",
      },
    ]
  }
  
  // Users for admin panel
  export const users = [
    {
      id: "1",
      name: "John",
      surname: "Doe",
      login: "user",
      role: "user",
    },
    {
      id: "2",
      name: "Admin",
      surname: "User",
      login: "admin",
      role: "admin",
    },
    {
      id: "3",
      name: "Jane",
      surname: "Smith",
      login: "jane",
      role: "user",
    },
    {
      id: "4",
      name: "Robert",
      surname: "Johnson",
      login: "robert",
      role: "user",
    },
  ]
  
  // Platform analytics for admin panel
  export const platformAnalytics = {
    totalUsers: 156,
    activeUsers: 89,
    totalProducts: 423,
    averagePriceChanges: 12,
    userGrowth: [12, 18, 22, 25, 30, 35],
    productActivity: [45, 52, 38, 65, 72, 58],
    botInteractions: [120, 145, 165, 190, 210, 230],
  }
  
  