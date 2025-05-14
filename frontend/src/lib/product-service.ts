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
}

export default ProductService
