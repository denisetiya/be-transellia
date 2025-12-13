import logger from '../../lib/lib.logger';
import { ExpenseRepository, type IExpense } from '../../models';

export interface ExpenseResult {
    data: (IExpense & { id: string }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export interface ExpensesResult {
    data: {
        expenses: (IExpense & { id: string })[];
        total: number;
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

export default class ExpenseService {
    
    /**
     * Create a new expense for a store
     */
    static async createExpense(storeId: string, data: {
        name: string;
        description?: string;
        amount: number;
        category: string;
        date?: Date;
    }): Promise<ExpenseResult> {
        try {
            logger.info(`Creating expense for store: ${storeId}`);
            
            const expenseData: Omit<IExpense, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                storeId,
                name: data.name,
                description: data.description,
                amount: data.amount,
                category: data.category,
                date: (data.date || new Date()).toISOString(),
            };
            
            const expense = await ExpenseRepository.create(expenseData);
            const created = expense as (IExpense & { id: string });
            
            logger.info(`Expense created successfully - ID: ${created.id}`);
            
            return {
                data: created,
                message: 'Pengeluaran berhasil dicatat',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to create expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to create expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get all expenses for a store with pagination
     */
    static async getExpensesByStoreId(storeId: string, page: number = 1, limit: number = 10): Promise<ExpensesResult> {
        try {
            logger.info(`Fetching expenses for store: ${storeId}`);
            
            const allExpenses = await ExpenseRepository.findByStoreId(storeId);
            const total = allExpenses.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            
            const expenses = allExpenses.slice(skip, skip + limit) as (IExpense & { id: string })[];
            
            // Calculate total amount
            const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            return {
                data: {
                    expenses,
                    total: totalAmount,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limit
                    }
                },
                message: 'Pengeluaran berhasil ditemukan',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to get expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to get expenses: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Delete expense
     */
    static async deleteExpense(expenseId: string): Promise<ExpenseResult> {
        try {
            logger.info(`Deleting expense: ${expenseId}`);
            
            const existing = await ExpenseRepository.findById(expenseId);
            
            if (!existing) {
                return {
                    data: null,
                    message: 'Expense not found',
                    success: false,
                    errorType: 'NOT_FOUND'
                };
            }
            
            await ExpenseRepository.delete(expenseId);
            
            return {
                data: existing as (IExpense & { id: string }),
                message: 'Pengeluaran berhasil dihapus',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Get total expenses for a store within a date range
     */
    static async getTotalExpenses(storeId: string, startDate?: Date, endDate?: Date): Promise<{ total: number; success: boolean; message: string }> {
        try {
            // For now, get all expenses and filter in memory
            const expenses = await ExpenseRepository.findByStoreId(storeId);
            
            let filtered = expenses;
            if (startDate || endDate) {
                filtered = expenses.filter(exp => {
                    const expDate = new Date(exp.date);
                    if (startDate && expDate < startDate) return false;
                    if (endDate && expDate > endDate) return false;
                    return true;
                });
            }
            
            const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
            
            return {
                total,
                success: true,
                message: 'Total pengeluaran berhasil dihitung'
            };
            
        } catch (error) {
            logger.error(`Failed to get total expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                total: 0,
                success: false,
                message: `Failed to get total expenses: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
