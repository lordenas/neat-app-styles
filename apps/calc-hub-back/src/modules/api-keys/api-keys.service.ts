import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../db/database.service';
import { apiKeys } from '../../db/schema';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly dbService: DatabaseService) {}

  async list(
    userId: string,
  ): Promise<Array<{ id: string; name: string; createdAt: Date }>> {
    const rows = await this.dbService.db.query.apiKeys.findMany({
      where: and(eq(apiKeys.userId, userId), eq(apiKeys.isRevoked, false)),
      columns: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
    return rows;
  }

  async create(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ id: string; name: string; apiKey: string }> {
    const rawKey = `ck_${randomUUID().replace(/-/g, '')}`;
    const keyHash = await bcrypt.hash(rawKey, 10);
    const [created] = await this.dbService.db
      .insert(apiKeys)
      .values({ userId, name: dto.name, keyHash })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
      });
    return {
      id: created.id,
      name: created.name,
      apiKey: rawKey,
    };
  }

  async revoke(userId: string, id: string): Promise<{ success: boolean }> {
    const [revoked] = await this.dbService.db
      .update(apiKeys)
      .set({ isRevoked: true })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning({ id: apiKeys.id });
    if (!revoked) {
      throw new NotFoundException('API key not found');
    }
    return { success: true };
  }

  async resolveByRawKey(
    rawKey: string,
  ): Promise<{ apiKeyId: string; userId: string } | null> {
    const keys = await this.dbService.db.query.apiKeys.findMany({
      where: eq(apiKeys.isRevoked, false),
      columns: {
        id: true,
        userId: true,
        keyHash: true,
      },
    });

    for (const key of keys) {
      const matches = await bcrypt.compare(rawKey, key.keyHash);
      if (matches) {
        return {
          apiKeyId: key.id,
          userId: key.userId,
        };
      }
    }
    return null;
  }
}
