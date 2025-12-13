import logger from '../../lib/lib.logger';
import { StoreRepository, type IStore } from '../../models';
import { generateId } from '../../lib/lib.id.generator';

export interface StoreResult {
    data: (IStore & { id: string }) | null;
    message: string;
    success: boolean;
    errorType?: string;
}

export default class StoreService {
    
    /**
     * Create a new store for a user
     */
    static async createStore(userId: string, name: string, address?: string): Promise<StoreResult> {
        try {
            logger.info(`Creating store for user: ${userId}`);
            
            // Check if user already has a store
            const existingStores = await StoreRepository.findByUserId(userId);
            if (existingStores.length > 0) {
                logger.warn(`User ${userId} already has a store`);
                return {
                    data: null,
                    message: 'User already has a store',
                    success: false,
                    errorType: 'DUPLICATE'
                };
            }
            
            const storeData: Omit<IStore, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
                userId,
                name,
                address,
            };
            
            const store = await StoreRepository.create(storeData);
            const created = store as (IStore & { id: string });
            
            logger.info(`Store created successfully - ID: ${created.id}`);
            
            return {
                data: created,
                message: 'Store berhasil dibuat',
                success: true
            };
            
        } catch (error) {
            logger.error(`Failed to create store: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                data: null,
                message: `Failed to create store: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }

    static async updateStore(storeId: string, userId: string, data: { name?: string, address?: string }) {
        try {
            const store = await StoreRepository.findById(storeId);
            if (!store) {
                throw new Error('Store not found');
            }
            if (store.userId !== userId) {
                 throw new Error('Unauthorized');
            }

            await StoreRepository.update(storeId, data);
            
            const updated = await StoreRepository.findById(storeId);

            return {
                success: true,
                message: 'Store updated successfully',
                data: updated as IStore
            };
        } catch (error) {
            logger.error(`Failed to update store: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}
