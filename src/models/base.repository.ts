import { Collection, Cluster } from 'couchbase';
import { getCollection, getCluster } from '../config/database';
import { generateId } from '../lib/lib.id.generator';
import env from '../config/env.config';
import logger from '../lib/lib.logger';

/**
 * Base interface for all documents
 */
export interface IBaseDocument {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Error codes from Couchbase SDK
 */
const COUCHBASE_ERROR_CODES = {
  DOCUMENT_NOT_FOUND: 13,
  DOCUMENT_EXISTS: 12,
} as const;

/**
 * Base Repository class providing common database operations
 * All model repositories should extend this class
 */
export class BaseRepository {
  /**
   * Get the default collection
   */
  protected static get collection(): Collection {
    return getCollection();
  }

  /**
   * Get the cluster instance
   */
  protected static get cluster(): Cluster {
    return getCluster();
  }

  /**
   * Get the bucket name from environment
   */
  protected static get bucketName(): string {
    return env.COUCHBASE_BUCKET;
  }

  /**
   * Check if an error is a "document not found" error
   */
  protected static isDocumentNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    // Check by error code
    if ('code' in error && (error as { code: unknown }).code === COUCHBASE_ERROR_CODES.DOCUMENT_NOT_FOUND) {
      return true;
    }

    // Check by error message
    if (error instanceof Error && error.message && error.message.toLowerCase().includes('not found')) {
      return true;
    }

    return false;
  }

  /**
   * Check if an error is a "document exists" error (duplicate)
   */
  protected static isDocumentExistsError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    if ('code' in error && (error as { code: unknown }).code === COUCHBASE_ERROR_CODES.DOCUMENT_EXISTS) {
      return true;
    }

    if (error instanceof Error && error.message && error.message.toLowerCase().includes('exists')) {
      return true;
    }

    return false;
  }

  /**
   * Execute a N1QL query with parameters
   * @param query - N1QL query string
   * @param parameters - Query parameters
   * @returns Array of results
   */
  protected static async executeQuery<T>(
    query: string,
    parameters: unknown[] = []
  ): Promise<T[]> {
    try {
      const result = await this.cluster.query(query, { parameters });
      return result.rows as T[];
    } catch (error) {
      logger.error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Execute a N1QL query and return the first result or null
   * @param query - N1QL query string
   * @param parameters - Query parameters
   * @returns First result or null
   */
  protected static async executeQueryOne<T>(
    query: string,
    parameters: unknown[] = []
  ): Promise<T | null> {
    const results = await this.executeQuery<T>(query, parameters);
    return results[0] ?? null;
  }

  /**
   * Get a document by ID
   * @param id - Document ID
   * @returns Document or null if not found
   */
  protected static async getById<T>(id: string): Promise<T | null> {
    try {
      const result = await this.collection.get(id);
      return result.content as T;
    } catch (error: unknown) {
      if (this.isDocumentNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Insert a new document
   * @param id - Document ID
   * @param doc - Document to insert
   */
  protected static async insertDoc<T extends IBaseDocument>(id: string, doc: T): Promise<void> {
    await this.collection.insert(id, doc);
  }

  /**
   * Replace an existing document
   * @param id - Document ID
   * @param doc - Updated document
   */
  protected static async replaceDoc<T extends IBaseDocument>(id: string, doc: T): Promise<void> {
    await this.collection.replace(id, doc);
  }

  /**
   * Remove a document by ID
   * @param id - Document ID
   */
  protected static async removeDoc(id: string): Promise<void> {
    await this.collection.remove(id);
  }

  /**
   * Generate a new unique ID
   */
  protected static generateId(): string {
    return generateId();
  }

  /**
   * Get current ISO timestamp
   */
  protected static now(): string {
    return new Date().toISOString();
  }

  /**
   * Build a SELECT query for a document type
   * @param type - Document type
   * @param whereClause - Additional WHERE conditions (without WHERE keyword)
   * @param orderBy - ORDER BY clause
   * @param limit - LIMIT value
   * @param offset - OFFSET value
   */
  protected static buildSelectQuery(
    type: string,
    whereClause?: string,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): string {
    let query = `SELECT t.* FROM \`${this.bucketName}\` t WHERE t.type = '${type}'`;
    
    if (whereClause) {
      query += ` AND ${whereClause}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    if (limit !== undefined) {
      query += ` LIMIT ${limit}`;
    }
    
    if (offset !== undefined) {
      query += ` OFFSET ${offset}`;
    }
    
    return query;
  }

  /**
   * Build a COUNT query for a document type
   * @param type - Document type
   * @param whereClause - Additional WHERE conditions
   */
  protected static buildCountQuery(type: string, whereClause?: string): string {
    let query = `SELECT COUNT(*) as total FROM \`${this.bucketName}\` t WHERE t.type = '${type}'`;
    
    if (whereClause) {
      query += ` AND ${whereClause}`;
    }
    
    return query;
  }
}
