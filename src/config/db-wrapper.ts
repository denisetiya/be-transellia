import { db } from './drizzle.config';
import logger from '../lib/lib.logger';

/**
 * Database query wrapper with retry logic for serverless environments
 * This wrapper helps mitigate connection pooling and prepared statement issues
 */
export class DatabaseWrapper {
    
    /**
     * Execute a database query with retry logic
     * @param queryFn - Function that executes the database query
     * @param maxRetries - Maximum number of retry attempts
     * @param operationName - Name of the operation for logging
     * @returns Promise with the query result
     */
    static async executeWithRetry<T>(
        queryFn: () => Promise<T>,
        maxRetries: number = 3,
        operationName: string = 'database operation'
    ): Promise<T> {
        const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';
        const retries = isServerless ? maxRetries : 1;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                logger.info(`Executing ${operationName} - Attempt ${attempt}/${retries}`);
                
                const startTime = Date.now();
                const result = await queryFn();
                const endTime = Date.now();
                
                logger.info(`${operationName} completed successfully in ${endTime - startTime}ms - Attempt ${attempt}`);
                return result;
                
            } catch (error) {
                logger.error(`${operationName} failed - Attempt ${attempt}/${retries}`);
                logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                logger.error(`Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
                
                // If this is the last attempt, throw the error
                if (attempt === retries) {
                    logger.error(`All ${retries} attempts failed for ${operationName}`);
                    throw error;
                }
                
                // For connection-related errors, wait before retrying
                if (error instanceof Error && (
                    error.message.includes('connection') ||
                    error.message.includes('timeout') ||
                    error.message.includes('PostgresJsPreparedQuery') ||
                    error.message.includes('ECONNREFUSED')
                )) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
                    logger.info(`Connection error detected in ${operationName}, waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                // For non-connection errors, don't retry
                logger.error(`Non-connection error in ${operationName}, not retrying`);
                throw error;
            }
        }
        
        // This should never be reached
        throw new Error(`Unexpected error in ${operationName}`);
    }
    
    /**
     * Execute a simple query without JOIN (most reliable for serverless)
     * @param queryFn - Function that executes the simple query
     * @param operationName - Name of the operation for logging
     * @returns Promise with the query result
     */
    static async executeSimpleQuery<T>(
        queryFn: () => Promise<T>,
        operationName: string = 'simple query'
    ): Promise<T> {
        return this.executeWithRetry(queryFn, 2, operationName);
    }
    
    /**
     * Execute multiple queries in sequence (avoiding JOINs)
     * @param queryFns - Array of query functions to execute
     * @param operationName - Name of the operation for logging
     * @returns Promise with array of results
     */
    static async executeSequentialQueries<T>(
        queryFns: (() => Promise<T>)[],
        operationName: string = 'sequential queries'
    ): Promise<T[]> {
        const results: T[] = [];
        
        for (let i = 0; i < queryFns.length; i++) {
            const queryFn = queryFns[i];
            if (!queryFn) {
                throw new Error(`Query function at index ${i} is undefined`);
            }
            
            const queryName = `${operationName} - Step ${i + 1}`;
            const result = await this.executeSimpleQuery(queryFn, queryName);
            results.push(result);
        }
        
        return results;
    }
}

// Export the database instance for direct use when needed
export { db };

export default DatabaseWrapper;