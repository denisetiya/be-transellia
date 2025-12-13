import logger from '../../lib/lib.logger';
import { ProductRepository, type IProduct } from '../../models';

export interface ProductResult {
    data: (IProduct & { id: string }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface ProductsResult {
    data: {
        products: (IProduct & { id: string })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    } | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export default class ProductService {
    
    /**
     * Create a new product for a store
     */
    static async createProduct(storeId: string, data: {
        name: string;
        description?: string;
        price: number;
        stock?: number;
        sku?: string;
    }): Promise<ProductResult> {
        try {
            logger.info(`Creating product for store: ${storeId}`);
            
            const productData: Omit<IProduct, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                storeId,
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock || 0,
                sku: data.sku,
            };
            
            const product = await ProductRepository.create(productData);
            const created = product as (IProduct & { id: string });
            
            logger.info(`Product created successfully - ID: ${created.id}`);
            
            return {
                data: created,
                message: 'Produk berhasil ditambahkan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get all products for a store with pagination
     */
    static async getProductsByStoreId(storeId: string, page: number = 1, limit: number = 10): Promise<ProductsResult> {
        try {
            logger.info(`Fetching products for store: ${storeId}`);
            
            const allProducts = await ProductRepository.findByStoreId(storeId);
            const total = allProducts.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            const products = allProducts.slice(skip, skip + limit) as (IProduct & { id: string })[];
            
            return {
                data: {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Produk berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get products: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get products: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get product by ID
     */
    static async getProductById(productId: string): Promise<ProductResult> {
        try {
            const product = await ProductRepository.findById(productId);
            
            if (!product) {
                return {
                    data: null,
                    message: 'Product not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            return {
                data: product as (IProduct & { id: string }),
                message: 'Produk ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get product: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get product: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Update product
     */
    static async updateProduct(productId: string, data: Partial<IProduct>): Promise<ProductResult> {
        try {
            logger.info(`Updating product: ${productId}`);
            
            const existing = await ProductRepository.findById(productId);
            
            if (!existing) {
                return {
                    data: null,
                    message: 'Product not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            await ProductRepository.update(productId, data);
            const updated = await ProductRepository.findById(productId) as (IProduct & { id: string });
            
            return {
                data: updated,
                message: 'Produk berhasil diperbarui',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Delete product
     */
    static async deleteProduct(productId: string): Promise<ProductResult> {
        try {
            logger.info(`Deleting product: ${productId}`);
            
            const existing = await ProductRepository.findById(productId);
            
            if (!existing) {
                return {
                    data: null,
                    message: 'Product not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            await ProductRepository.delete(productId);
            
            return {
                data: existing as (IProduct & { id: string }),
                message: 'Produk berhasil dihapus',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Update stock (for inventory management / opname)
     */
    static async updateStock(productId: string, stockChange: number, isAbsolute: boolean = false): Promise<ProductResult> {
        try {
            logger.info(`Updating stock for product: ${productId}, change: ${stockChange}, absolute: ${isAbsolute}`);
            
            const product = await ProductRepository.findById(productId);
            
            if (!product) {
                return {
                    data: null,
                    message: 'Product not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const newStock = isAbsolute ? stockChange : product.stock + stockChange;
            
            if (newStock < 0) {
                return {
                    data: null,
                    message: 'Insufficient stock',
                    success: false,
                    errorType: 'VALIDATION_ERROR'
                };
            }
            
            await ProductRepository.update(productId, { stock: newStock });
            const updated = await ProductRepository.findById(productId) as (IProduct & { id: string });
            
            logger.info(`Stock updated for product ${productId}: ${product.stock} -> ${newStock}`);
            
            return {
                data: updated,
                message: 'Stok berhasil diperbarui',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
}
