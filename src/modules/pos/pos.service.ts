import logger from '../../lib/lib.logger';
import { HistorySaleRepository, ProductRepository, type IHistorySale, type ISaleItem, type PaymentMethod } from '../../models';
import ExpenseService from '../expense/expense.service';

export interface CheckoutResult {
    data: {
        sale: IHistorySale & { id: string };
        receipt: {
            receiptNumber: string;
            storeName?: string;
            items: ISaleItem[];
            totalAmount: number;
            paymentMethod?: PaymentMethod;
            cashier?: string;
            date: Date;
        };
    } | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface SalesResult {
    data: {
        sales: (IHistorySale & { id: string })[];
        totalRevenue: number;
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

export interface ProfitLossResult {
    data: {
        totalSales: number;
        totalExpenses: number;
        netProfit: number;
        period: {
            start?: Date;
            end?: Date;
        };
    } | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export default class POSService {
    
    /**
     * Generate unique receipt number
     */
    private static generateReceiptNumber(): string {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `RCP-${dateStr}-${random}`;
    }
    
    /**
     * Process checkout / create sale
     */
    static async checkout(
        storeId: string,
        employeeId: string,
        items: { productId: string; quantity: number }[],
        paymentMethod?: PaymentMethod,
        customerName?: string,
        customerPhone?: string,
        notes?: string
    ): Promise<CheckoutResult> {
        try {
            logger.info(`Processing checkout for store: ${storeId}`);
            
            // Validate and process items
            const processedItems: ISaleItem[] = [];
            let totalAmount = 0;
            
            for (const item of items) {
                const product = await ProductRepository.findById(item.productId);
                
                if (!product) {
                    return {
                        data: null,
                        message: `Product ${item.productId} not found`,
                        success: false,
                        errorType: 'NOT_FOUND'
                    };
                }
                
                if (product.stock < item.quantity) {
                    return {
                        data: null,
                        message: `Insufficient stock for product ${product.name}`,
                        success: false,
                        errorType: 'VALIDATION_ERROR'
                    };
                }
                
                const subtotal = product.price * item.quantity;
                processedItems.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    subtotal
                });
                totalAmount += subtotal;
                
                // Decrement stock
                await ProductRepository.update(product.id, { stock: product.stock - item.quantity });
                logger.info(`Decremented stock for ${product.name}: ${product.stock} -> ${product.stock - item.quantity}`);
            }
            
            const receiptNumber = this.generateReceiptNumber();
            
            const saleData: Omit<IHistorySale, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                storeId,
                employeeId,
                items: processedItems,
                totalAmount,
                paymentMethod,
                customerName,
                customerPhone,
                receiptNumber,
                notes,
            };
            
            const sale = await HistorySaleRepository.create(saleData);
            const created = sale as (IHistorySale & { id: string });
            
            logger.info(`Sale created successfully - Receipt: ${receiptNumber}, Total: ${totalAmount}`);
            
            return {
                data: {
                    sale: created,
                    receipt: {
                        receiptNumber,
                        items: processedItems,
                        totalAmount,
                        paymentMethod,
                        date: new Date(),
                    }
                },
                message: 'Transaksi berhasil',
                success: true
            };
            
        } catch (error) {
            logger.error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get sales history for a store
     */
    static async getSales(storeId: string, page: number = 1, limit: number = 10): Promise<SalesResult> {
        try {
            logger.info(`Fetching sales for store: ${storeId}`);
            
            // Note: Pagination needs to be implemented in repository if efficient pagination is required
            // For now, fetching all and filtering in memory or using simpler repository methods if available
            // HistorySaleRepository.findByStoreId currently returns all.
            // Ideally we should add pagination to repository.
            
            const allSales = await HistorySaleRepository.findByStoreId(storeId);
            const total = allSales.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            // Manual pagination for now as repository returns all
            const sales = allSales.slice(skip, skip + limit) as (IHistorySale & { id: string })[];
            const totalRevenue = allSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            return {
                data: {
                    sales,
                    totalRevenue,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Riwayat penjualan berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get sales: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get sales: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get sale by receipt number (for e-receipt viewing)
     */
    static async getSaleByReceiptNumber(receiptNumber: string): Promise<CheckoutResult> {
        try {
            logger.info(`Fetching sale by receipt number: ${receiptNumber}`);
            
            const sale = await HistorySaleRepository.findByReceiptNumber(receiptNumber);
            
            if (!sale) {
                logger.warn(`Sale not found for receipt number: ${receiptNumber}`);
                return {
                    data: null,
                    message: 'Struk tidak ditemukan',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            const saleWithId = sale as (IHistorySale & { id: string });
            
            logger.info(`Sale found for receipt number: ${receiptNumber}`);
            
            return {
                data: {
                    sale: saleWithId,
                    receipt: {
                        receiptNumber: saleWithId.receiptNumber || receiptNumber,
                        items: saleWithId.items,
                        totalAmount: saleWithId.totalAmount,
                        paymentMethod: saleWithId.paymentMethod,
                        date: new Date(saleWithId.createdAt),
                    }
                },
                message: 'Struk berhasil ditemukan',
                success: true
            };
             
        } catch (error) {
            logger.error(`Failed to get receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Gagal mengambil struk: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Calculate Profit & Loss report
     */
    static async getProfitLoss(storeId: string, startDate?: Date, endDate?: Date): Promise<ProfitLossResult> {
        try {
            logger.info(`Calculating P&L for store: ${storeId}`);
            
            // Get all sales
            const allSales = await HistorySaleRepository.findByStoreId(storeId);
            const salesData = allSales as (IHistorySale & { id: string })[];
            
            // Filter by date if provided
            let filteredSales = salesData;
            if (startDate || endDate) {
                filteredSales = salesData.filter(sale => {
                    const saleDate = new Date(sale.createdAt || new Date());
                    if (startDate && saleDate < startDate) return false;
                    if (endDate && saleDate > endDate) return false;
                    return true;
                });
            }
            
            const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            // Get total expenses
            const expenseResult = await ExpenseService.getTotalExpenses(storeId, startDate, endDate);
            const totalExpenses = expenseResult.success ? expenseResult.total : 0;
            
            const netProfit = totalSales - totalExpenses;
            
            return {
                data: {
                    totalSales,
                    totalExpenses,
                    netProfit,
                    period: {
                        start: startDate,
                        end: endDate
                    }
                },
                message: 'Laporan Laba Rugi berhasil dihitung',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to calculate P&L: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to calculate P&L: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
}
