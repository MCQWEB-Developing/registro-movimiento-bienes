import { Injectable, inject, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface InventoryEntry {
    id?: string;
    code: string;
    entry_date: string; // Date string YYYY-MM-DD
    document_type: string;
    provider?: string;
    description: string;
    unit: string;
    quantity: number;
    deliverer: string;
    receiver: string;
    entry_type: string;
    created_at?: string;
}

export interface InventoryExit {
    id?: string;
    code: string;
    exit_date: string;
    document_type: string;
    requesting_area: string;
    description: string;
    unit: string;
    quantity: number;
    authorizer: string;
    receiver: string;
    reason: string;
    created_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    // --- ENTRIES ---

    async getEntries() {
        const { data, error } = await this.supabase
            .from('inventory_entries')
            .select('*')
            .order('entry_date', { ascending: false });

        if (error) throw error;
        return data as InventoryEntry[];
    }

    async createEntry(entry: InventoryEntry) {
        const { data, error } = await this.supabase
            .from('inventory_entries')
            .insert(entry)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateEntry(id: string, entry: Partial<InventoryEntry>) {
        const { data, error } = await this.supabase
            .from('inventory_entries')
            .update(entry)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteEntry(id: string) {
        const { error } = await this.supabase
            .from('inventory_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- EXITS ---

    async getExits() {
        const { data, error } = await this.supabase
            .from('inventory_exits')
            .select('*')
            .order('exit_date', { ascending: false });

        if (error) throw error;
        return data as InventoryExit[];
    }

    async createExit(exit: InventoryExit) {
        const { data, error } = await this.supabase
            .from('inventory_exits')
            .insert(exit)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateExit(id: string, exit: Partial<InventoryExit>) {
        const { data, error } = await this.supabase
            .from('inventory_exits')
            .update(exit)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteExit(id: string) {
        const { error } = await this.supabase
            .from('inventory_exits')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- STOCK & REQUESTS (DOCENTE) ---

    async getStock() {
        const { data, error } = await this.supabase
            .from('view_inventory_stock')
            .select('*')
            .order('description', { ascending: true });

        if (error) throw error;
        return data as { code: string, description: string, unit: string, stock: number }[];
    }

    async getUserRequests() {
        const { data, error } = await this.supabase
            .from('product_requests')
            .select(`
                *,
                items:product_request_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async createRequest(items: any[]) {
        const user = await this.supabase.auth.getUser();
        if (!user.data.user) throw new Error('No usuario autenticado');

        // 1. Create the Request Header
        const { data: requestData, error: requestError } = await this.supabase
            .from('product_requests')
            .insert({ user_id: user.data.user.id })
            .select()
            .single();

        if (requestError) throw requestError;

        await this.createRequestItems(requestData.id, items);

        return requestData;
    }

    async updateRequest(id: string, items: any[]) {
        // 1. Update timestamp (optional, or rely on triggers)
        const { error: updateError } = await this.supabase
            .from('product_requests')
            .update({ created_at: new Date() }) // Just to touch the record or maybe add updated_at col later
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Delete existing items
        const { error: deleteError } = await this.supabase
            .from('product_request_items')
            .delete()
            .eq('request_id', id);

        if (deleteError) throw deleteError;

        // 3. Re-create items
        await this.createRequestItems(id, items);
    }

    private async createRequestItems(requestId: string, items: any[]) {
        const itemsToInsert = items.map(item => ({
            request_id: requestId,
            product_code: item.product_code,
            product_name: item.product_name,
            quantity_requested: item.quantity_requested,
            is_new_product: item.is_new_product,
            description: item.description
        }));

        const { error: itemsError } = await this.supabase
            .from('product_request_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;
    }

    // --- DIRECTOR REQUEST MANAGEMENT ---

    async getAllRequests() {
        // RLS allows directors to see all
        const { data, error } = await this.supabase
            .from('product_requests')
            .select(`
                *,
                profile:profiles (display_name, email),
                items:product_request_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async updateRequestItemStatus(itemId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
        const user = await this.supabase.auth.getUser();
        const { error } = await this.supabase
            .from('product_request_items')
            .update({
                status: status,
                reviewed_at: new Date(),
                reviewed_by: user.data.user?.id
            })
            .eq('id', itemId);

        if (error) throw error;
    }

    // --- NOTIFICATIONS ---

    // --- NOTIFICATIONS ---

    // We expose a signal for the pending count so any component can read it
    pendingRequestsCount = signal(0);
    private authSubscription: any;

    async initializeNotifications() {
        // 1. Load initial count
        this.refreshPendingCount();

        // 2. Subscribe to changes
        // Use a filter if possible, or just listen to all changes on product_requests
        this.authSubscription = this.supabase
            .channel('public:product_requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_requests' }, () => {
                // On any change (INSERT, UPDATE, DELETE), refresh the count
                this.refreshPendingCount();
            })
            .subscribe();
    }

    async refreshPendingCount() {
        // Only fetch if user is authenticated (or check role)
        // But for simplicity, we just run the query. RLS ensures we only see what we can see.
        const { count, error } = await this.supabase
            .from('product_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING');

        if (!error) {
            this.pendingRequestsCount.set(count || 0);
        }
    }

    // Legacy method if needed, but should be replaced by reading the signal
    async getPendingRequestsCount() {
        const { count, error } = await this.supabase
            .from('product_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING');

        if (error) throw error;
        return count || 0;
    }
}