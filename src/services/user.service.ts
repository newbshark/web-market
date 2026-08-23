import { getKnex } from '../common/database/knex.js';
import logger from '../common/logger/logger.js';

export class UserService {
    private knex = getKnex();

    async updateUserName(userId: number, newName: string) {
        try {
            const [updatedUser] = await this.knex('users')
                .where('id', userId)
                .update({ name: newName })
                .returning(['id', 'name', 'email']);

            if (!updatedUser) {
                throw new Error('User not found');
            }

            logger.info(`User ${userId} updated name to ${newName}`);
            return updatedUser;
        } catch (error) {
            logger.error('Error in updateUserName:', error);
            throw error;
        }
    }


    async getUserById(userId: number) {
        try {
            const user = await this.knex('users')
                .select('id', 'name', 'email', 'role', 'created_at')
                .where('id', userId)
                .first();

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            logger.error('Error in getUserById:', error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            const user = await this.knex('users')
                .select('id', 'name', 'email', 'role', 'created_at')
                .where('email', email)
                .first();

            return user;
        } catch (error) {
            logger.error('Error in getUserByEmail:', error);
            throw error;
        }
    }

    async getAllUsers(limit: number = 20, page: number = 1) {
        try {
            const offset = (page - 1) * limit;

            const users = await this.knex('users')
                .select('id', 'name', 'email', 'role', 'created_at')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset(offset);

            const [countResult] = await this.knex('users').count('id as total');
            const total = Number(countResult?.total) || 0;

            return { users, total };
        } catch (error) {
            logger.error('Error in getAllUsers:', error);
            throw error;
        }
    }
    async searchUsers(searchTerm: string) {
        const users = await this.knex('users')
            .select('id', 'name', 'email')
            .where('name', 'ilike', `%${searchTerm}%`)
            .orWhere('email', 'ilike', `%${searchTerm}%`)
            .limit(10);
        return users;
    }


    async userExists(email: string): Promise<boolean> {
        const user = await this.knex('users')
            .select('id')
            .where('email', email)
            .first();
        return !!user;
    }


    async updateUserRole(userId: number, role: 'admin' | 'customer') {
        const [updated] = await this.knex('users')
            .where('id', userId)
            .update({ role })
            .returning(['id', 'name', 'email', 'role']);

        if (!updated) {
            throw new Error('User not found');
        }
        return updated;
    }
}

export const userService = new UserService();