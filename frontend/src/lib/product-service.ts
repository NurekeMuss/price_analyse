import axiosInstance from "./axios"

export interface Product {
  id: number
  name: string
  description: string
  quantity: number
  price: number
  is_active: boolean
  image_url: string
  created_at: string
  rating?: number
  views?: number
  purchases?: number
  margin?: number
  description_length?: number
  product_of_the_day?: number
  prediction?: number
}

export interface CreateProductData {
  name: string
  description: string
  quantity: number
  price: number
  is_active: boolean
  image_url: string
}

export interface UpdateProductData {
  name?: string
  description?: string
  quantity?: number
  price?: number
  is_active?: boolean
  image_url?: string
}

export interface ProductsResponse {
  data: Product[]
  total: number
  skip: number
  limit: number
}

export interface ProductsOfTheDayResponse {
  count: number
  products: Product[]
}

const ProductService = {
  async getProducts(skip = 0, limit = 100): Promise<Product[]> {
    try {
      const response = await axiosInstance.get(`/products/?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  },

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await axiosInstance.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw error
    }
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await axiosInstance.post("/products/", data)
      return response.data
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  },

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    try {
      const response = await axiosInstance.put(`/products/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating product ${id}:`, error)
      throw error
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/products/${id}`)
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error)
      throw error
    }
  },

  async getProductsWithPagination(page = 1, limit = 10): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit
    try {
      const response = await axiosInstance.get(`/products/?skip=${skip}&limit=${limit}`)
      return {
        data: response.data,
        total: Number.parseInt(response.headers["x-total-count"] || "0", 10) || response.data.length * 2, // Fallback if header not available
      }
    } catch (error) {
      console.error("Error fetching products with pagination:", error)
      throw error
    }
  },

  async getRecommendedPrice(productId: number): Promise<number> {
    try {
      const response = await axiosInstance.get(`/products/ml/recommend_price/${productId}`)
      return response.data.recommended_price
    } catch (error) {
      console.error(`Error fetching recommended price for product ${productId}:`, error)
      throw error
    }
  },

  async getProductsOfTheDay(): Promise<ProductsOfTheDayResponse> {
    try {
      const response = await axiosInstance.get("/products/ml/products_of_the_day")
      return response.data
    } catch (error) {
      console.error("Error fetching products of the day:", error)
      throw error
    }
  },
}

export default ProductService
