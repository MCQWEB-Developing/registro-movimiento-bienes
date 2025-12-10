import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { DirectorDashboardComponent } from './features/director/dashboard/director-dashboard.component';

import { RoleGuard } from './core/guards/role.guard';

import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DirectorLayoutComponent } from './features/director/layout/director-layout.component';
import { DocenteLayoutComponent } from './features/docente/layout/docente-layout.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
            { path: '', component: AdminDashboardComponent },
            { path: 'users', loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent) },
            { path: 'settings', loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) }
        ]
    },
    {
        path: 'director',
        component: DirectorLayoutComponent,
        canActivate: [RoleGuard],
        data: { roles: ['director'] },
        children: [
            { path: '', component: DirectorDashboardComponent },
            {
                path: 'inventory',
                loadComponent: () => import('./features/director/inventory/inventory-list.component').then(m => m.InventoryListComponent)
            },
            {
                path: 'inventory-exits',
                loadComponent: () => import('./features/director/inventory-exits/inventory-exit-list.component').then(m => m.InventoryExitListComponent)
            },
            {
                path: 'requests',
                loadComponent: () => import('./features/director/requests/director-request-list.component').then(m => m.DirectorRequestListComponent)
            }
        ]
    },
    {
        path: 'docente',
        component: DocenteLayoutComponent,
        canActivate: [RoleGuard],
        data: { roles: ['docente'] },
        children: [
            { path: '', redirectTo: 'requests', pathMatch: 'full' },
            {
                path: 'requests',
                loadComponent: () => import('./features/docente/requests/request-list.component').then(m => m.RequestListComponent)
            }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
