import { Component, inject, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, InventoryExit } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-inventory-exit-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h3>{{ exit() ? 'Editar Salida' : 'Nueva Salida de Almacén' }}</h3>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <div class="row">
                <div class="form-group col">
                    <label>Código</label>
                    <input type="text" formControlName="code" placeholder="Ej: CK0001">
                </div>
                <div class="form-group col-small">
                    <label>Fecha</label>
                    <input type="date" formControlName="exit_date">
                </div>
            </div>

            <div class="row">
                <div class="form-group col">
                    <label>Documento de Salida</label>
                     <select formControlName="document_type">
                        <option value="Acta de entrega">Acta de entrega</option>
                        <option value="Pecosa">Pecosa</option>
                        <option value="Solicitud">Solicitud</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div class="form-group col">
                    <label>Área/Programa que Solicita</label>
                    <input type="text" formControlName="requesting_area">
                </div>
            </div>

            <div class="form-group">
                <label>Descripción del Producto</label>
                <input type="text" formControlName="description">
            </div>

            <div class="row">
                <div class="form-group col">
                    <label>Unidad de Medida</label>
                    <select formControlName="unit">
                        <option value="UNIDAD">UNIDAD</option>
                        <option value="GAL.">GALÓN</option>
                        <option value="LITRO">LITRO</option>
                        <option value="PIE3">PIE3</option>
                        <option value="METROS">METROS</option>
                        <option value="KILO">KILO</option>
                        <option value="CAJA">CAJA</option>
                        <option value="JUEGO">JUEGO</option>
                        <option value="OTRO">OTRO</option>
                    </select>
                </div>
                <div class="form-group col-small">
                    <label>Cant.</label>
                    <input type="number" formControlName="quantity" min="1">
                </div>
            </div>

            <div class="row">
                <div class="form-group col">
                    <label>Responsable que Autoriza</label>
                    <input type="text" formControlName="authorizer">
                </div>
                <div class="form-group col">
                    <label>Responsable que Recibe</label>
                    <input type="text" formControlName="receiver">
                </div>
            </div>

             <div class="form-group">
                <label>Motivo de Salida</label>
                <input type="text" formControlName="reason">
            </div>

          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }

          <div class="actions">
            <button type="button" (click)="close.emit()" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="isLoading()">
              {{ isLoading() ? 'Guardando...' : (exit() ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }
    
    .row {
        display: flex;
        gap: 1rem;
    }
    
    .col {
        flex: 1;
    }
    .col-small {
        width: 100px;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    input, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #ef4444; 
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-primary {
      background-color: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background-color: #fee2e2;
      border-radius: 0.375rem;
    }
  `]
})
export class InventoryExitFormComponent {
    private fb = inject(FormBuilder);
    private inventoryService = inject(InventoryService);

    exit = input<InventoryExit | null>(null);
    close = output<void>();
    saved = output<void>();

    today = new Date().toISOString().split('T')[0];

    form: FormGroup = this.fb.group({
        code: ['', [Validators.required]],
        exit_date: [this.today, [Validators.required]],
        document_type: ['Acta de entrega', [Validators.required]],
        requesting_area: ['', [Validators.required]],
        description: ['', [Validators.required]],
        unit: ['UNIDAD', [Validators.required]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        authorizer: ['Dirección', [Validators.required]],
        receiver: ['', [Validators.required]],
        reason: ['', [Validators.required]]
    });

    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    constructor() {
        effect(() => {
            const e = this.exit();
            if (e) {
                this.form.patchValue(e);
            }
        });
    }

    onSubmit() {
        if (this.form.valid) {
            this.isLoading.set(true);
            this.errorMessage.set(null);

            const formData = this.form.value;
            const e = this.exit();

            if (e && e.id) {
                // Update
                this.inventoryService.updateExit(e.id, formData)
                    .then(() => {
                        this.isLoading.set(false);
                        this.saved.emit();
                        this.close.emit();
                    })
                    .catch(err => {
                        this.isLoading.set(false);
                        this.errorMessage.set(err.message);
                    });
            } else {
                // Create
                this.inventoryService.createExit(formData)
                    .then(() => {
                        this.isLoading.set(false);
                        this.saved.emit();
                        this.close.emit();
                    })
                    .catch(err => {
                        this.isLoading.set(false);
                        this.errorMessage.set(err.message);
                    });
            }

        } else {
            this.form.markAllAsTouched();
        }
    }
}
