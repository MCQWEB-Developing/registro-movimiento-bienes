import { Component, inject, signal, output, computed, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';

interface StockItem {
    code: string;
    description: string;
    unit: string;
    stock: number;
}

interface RequestItem {
    product_code?: string;
    product_name: string;
    stock_available: number;
    quantity_requested: number;
    is_new_product: boolean;
    description?: string; // For new products
}


@Component({
    selector: 'app-request-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h3>{{ requestToEdit() ? 'Editar Solicitud (' + requestToEdit().request_code + ')' : 'Nueva Solicitud de Materiales' }}</h3>
        
        <div class="form-container">
            <!-- Product Search -->
            <div class="search-section">
                <label>Buscar Producto del Inventario</label>
                <div class="search-box">
                    <input 
                        type="text" 
                        [(ngModel)]="searchTerm" 
                        (input)="filterStock()"
                        placeholder="Escribe el nombre del producto..."
                        class="form-control"
                    >
                    @if (showSuggestions() && filteredStock().length > 0) {
                        <ul class="suggestions-list">
                            @for (item of filteredStock(); track item.code) {
                                <li (click)="selectProduct(item)">
                                    <span class="prod-name">{{ item.description }}</span>
                                    <span class="prod-stock" [class.no-stock]="item.stock <= 0">
                                        Stock: {{ item.stock }} {{ item.unit }}
                                    </span>
                                </li>
                            }
                        </ul>
                    }
                </div>
                
                @if (selectedStockItem()) {
                    <div class="selected-product-info">
                        <p><strong>Producto:</strong> {{ selectedStockItem()?.description }}</p>
                        <p><strong>Unidad:</strong> {{ selectedStockItem()?.unit }}</p>
                        <p><strong>Disponible:</strong> {{ selectedStockItem()?.stock }}</p>
                        
                        @if (selectedStockItem()!.stock > 0) {
                           <div class="quantity-control">
                                <label>Cantidad a solicitar:</label>
                                <input type="number" [(ngModel)]="quantityInput" min="1" [max]="selectedStockItem()!.stock" class="form-control small">
                                <button class="btn-add" (click)="addItemFromStock()">Agregar a la lista</button>
                           </div> 
                        } @else {
                            <p class="text-error">Sin stock disponible.</p>
                            <button class="btn-secondary small" (click)="requestAsNew()">Solicitar Compra/Ingreso</button>
                        }
                    </div>
                }

                @if (!selectedStockItem() && searchTerm().length > 2 && filteredStock().length === 0) {
                    <div class="not-found-msg">
                        <p>No encontramos "{{ searchTerm() }}" en el inventario.</p>
                        <button class="btn-outline" (click)="requestAsNew(searchTerm())">
                            Solicitar como Nuevo Producto
                        </button>
                    </div>
                }
            </div>

            <!-- Basket -->
            <div class="basket-section">
                <h4>Ítems en esta solicitud:</h4>
                @if (basket().length === 0) {
                    <p class="empty-basket">Tu lista está vacía.</p>
                } @else {
                    <ul class="basket-list">
                        @for (item of basket(); track $index) {
                            <li>
                                <div class="item-details">
                                    <span class="item-name">{{ item.product_name }}</span>
                                    <span class="item-qty">Cant: {{ item.quantity_requested }}</span>
                                    @if (item.is_new_product) {
                                        <span class="badge-new">Solicitud de Registro</span>
                                    }
                                </div>
                                <button class="btn-remove" (click)="removeItem($index)">❌</button>
                            </li>
                        }
                    </ul>
                }
            </div>

            @if (errorMessage()) {
                <div class="error-message">{{ errorMessage() }}</div>
            }

            <div class="actions">
                <button class="btn-secondary" (click)="close.emit()">Cancelar</button>
                <button class="btn-primary" [disabled]="basket().length === 0 || isLoading()" (click)="submitRequest()">
                    {{ isLoading() ? 'Enviando...' : 'Enviar Solicitud' }}
                </button>
            </div>
        </div>

      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; justify-content: center; align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white; padding: 2rem; border-radius: 0.5rem;
      width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto;
    }
    h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    
    .form-control {
        width: 100%; padding: 0.75rem; border: 1px solid #ccc;
        border-radius: 4px; font-size: 1rem; box-sizing: border-box;
    }
    .form-control.small { width: 100px; display: inline-block; margin-right: 1rem; }

    .search-box { position: relative; margin-bottom: 1rem; }
    
    .suggestions-list {
        position: absolute; top: 100%; left: 0; right: 0;
        background: white; border: 1px solid #ddd;
        list-style: none; padding: 0; margin: 0;
        max-height: 200px; overflow-y: auto;
        z-index: 10;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .suggestions-list li {
        padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between;
    }
    .suggestions-list li:hover { background-color: #f9fafb; }
    .prod-stock { font-size: 0.85rem; color: #059669; }
    .prod-stock.no-stock { color: #dc2626; }

    .selected-product-info {
        background: #f3f4f6; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;
    }
    .quantity-control { margin-top: 1rem; display: flex; align-items: center; }

    .basket-section { margin-top: 2rem; border-top: 2px dashed #eee; padding-top: 1rem; }
    .basket-list { list-style: none; padding: 0; }
    .basket-list li {
        background: #fff; border: 1px solid #ddd; padding: 0.75rem;
        margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;
        border-radius: 4px;
    }
    .badge-new { background: #dbeafe; color: #1e40af; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; }
    .btn-remove { background: none; border: none; cursor: pointer; }

    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    
    .btn-primary { background: #7c3aed; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: white; border: 1px solid #ccc; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }
    .btn-add { background: #059669; color: white; border: none; padding: 0.75rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-outline { background: white; border: 1px solid #7c3aed; color: #7c3aed; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem; }
    
    .text-error { color: #dc2626; font-weight: bold; }
    .error-message { color: white; background: #dc2626; padding: 0.5rem; border-radius: 4px; margin-top: 1rem; }
  `]
})
export class RequestFormComponent {
    private inventoryService = inject(InventoryService);

    close = output<void>();
    saved = output<void>();

    userInfo = signal<any>(null); // To store current user info if needed

    // Search & Stock
    allStock = signal<StockItem[]>([]);
    filteredStock = signal<StockItem[]>([]);
    searchTerm = signal('');
    showSuggestions = signal(false);

    selectedStockItem = signal<StockItem | null>(null);
    quantityInput = signal(1);

    // Basket
    basket = signal<RequestItem[]>([]);

    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    requestToEdit = input<any>(null);

    constructor() {
        this.loadStock();

        effect(() => {
            const req = this.requestToEdit();
            if (req && req.items) {
                // Populate basket from existing request
                // We need to match stock items if possible to show current stock availability
                this.basket.set(req.items.map((item: any) => ({
                    product_code: item.product_code,
                    product_name: item.product_name,
                    stock_available: 0, // Will be updated when stock loads or we can find it now
                    quantity_requested: item.quantity_requested,
                    is_new_product: item.is_new_product,
                    description: item.description
                })));
            }
        });
    }

    async loadStock() {
        try {
            const data = await this.inventoryService.getStock();
            this.allStock.set(data);
            // Update stock availability in basket if editing
            if (this.basket().length > 0) {
                this.basket.update(items => items.map(i => {
                    const stockItem = data.find(s => s.code === i.product_code);
                    return { ...i, stock_available: stockItem?.stock || 0 };
                }));
            }
        } catch (err: any) {
            console.error('Error loading stock', err);
        }
    }

    filterStock() {
        const term = this.searchTerm().toLowerCase();
        if (term.length < 1) {
            this.filteredStock.set([]);
            this.showSuggestions.set(false);
            return;
        }

        const matches = this.allStock().filter(item =>
            item.description.toLowerCase().includes(term) ||
            item.code.toLowerCase().includes(term)
        );
        this.filteredStock.set(matches);
        this.showSuggestions.set(true);
        this.selectedStockItem.set(null); // Reset selection if typing
    }

    selectProduct(item: StockItem) {
        this.selectedStockItem.set(item);
        this.searchTerm.set(item.description);
        this.showSuggestions.set(false);
        this.quantityInput.set(1);
    }

    addItemFromStock() {
        const item = this.selectedStockItem();
        const qty = this.quantityInput();

        if (!item) return;
        if (qty > item.stock) {
            alert('Cantidad excede stock disponible');
            return;
        }

        this.basket.update(prev => [...prev, {
            product_code: item.code,
            product_name: item.description,
            stock_available: item.stock,
            quantity_requested: qty,
            is_new_product: false
        }]);

        // Reset Search
        this.searchTerm.set('');
        this.selectedStockItem.set(null);
        this.quantityInput.set(1);
    }

    requestAsNew(nameOverride?: string) {
        const name = nameOverride || (this.selectedStockItem()?.description || this.searchTerm());

        // Simple prompt for now, could be a better UI
        const qtyStr = prompt(`Cantidad a solicitar para "${name}" (Producto Nuevo/Sin Stock):`, '1');
        if (!qtyStr) return;

        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty) || qty < 1) return;

        this.basket.update(prev => [...prev, {
            product_name: name,
            stock_available: 0,
            quantity_requested: qty,
            is_new_product: true,
            description: 'Solicitud de compra/registro'
        }]);

        // Reset Search
        this.searchTerm.set('');
        this.selectedStockItem.set(null);
        this.quantityInput.set(1);
    }

    removeItem(index: number) {
        this.basket.update(prev => prev.filter((_, i) => i !== index));
    }

    async submitRequest() {
        if (this.basket().length === 0) return;

        this.isLoading.set(true);
        this.errorMessage.set(null);

        try {
            if (this.requestToEdit()) {
                await this.inventoryService.updateRequest(this.requestToEdit().id, this.basket());
            } else {
                await this.inventoryService.createRequest(this.basket());
            }
            this.saved.emit();
            this.close.emit();
        } catch (err: any) {
            this.errorMessage.set(err.message || 'Error al enviar solicitud');
            this.isLoading.set(false);
        }
    }
}
