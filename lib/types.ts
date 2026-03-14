export type UserRole = 'ADMIN' | 'ORGANIZATION';

export interface Contact {
  type: 'email' | 'whatsapp' | 'link';
  value: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
}

export type {
  Organization,
  Event,
  Category,
  NewOrganization,
  NewEvent,
  NewCategory,
} from './db/schema';
