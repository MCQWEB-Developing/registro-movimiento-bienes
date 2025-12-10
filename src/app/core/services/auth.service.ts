import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { from, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabase: SupabaseClient;
    private router = inject(Router);

    currentUser = signal<User | null>(null);
    userRole = signal<string | null>(null);

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

        // Initialize user from session
        /* this.supabase.auth.getSession().then(({ data: { session } }) => {
            console.info('Supabase Session Check: ', session ? 'Session found' : 'No session');
            // Ping database to check connection
            this.supabase.from('profiles').select('count', { count: 'exact', head: true })
                .then(({ error }) => {
                    if (error) console.error('Supabase DB Connection Error:', error.message);
                    else console.info('Supabase DB Connection: OK');
                });

            if (session?.user) {
                this.currentUser.set(session.user);
                this.fetchUserRole(session.user.id);
            } else {
                this.currentUser.set(null);
                this.userRole.set(null);
            }
        }); */

        // Listen to verification changes
        this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                this.currentUser.set(session.user);
                // We don't strictly *need* to fetch here if login already did it, 
                // but good for persistence on refresh
                if (!this.userRole()) {
                    this.fetchUserRole(session.user.id);
                }
            } else {
                this.currentUser.set(null);
                this.userRole.set(null);
                this.router.navigate(['/login']);
            }
        });
    }

    private async fetchUserRole(userId: string) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (data) {
                this.userRole.set(data.role);
            } else if (error) {
                console.error('Error fetching role:', error);
            }
        } catch (e) {
            console.error('Exception fetching role:', e);
        }
    }

    login(credentials: { username: string; password: string }): Observable<any> {
        // Return a promise converted to observable that does both steps
        return from((async () => {
            // 1. Sign In
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: credentials.username,
                password: credentials.password
            });

            if (error) throw error;

            // 2. Fetch Role
            if (data.session?.user) {
                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.session.user.id)
                    .single();

                if (profileError) {
                    // Propagate this error so the UI knows something went wrong with the DB
                    throw new Error('Error recuperando perfil: ' + profileError.message + ' (Hint: ¿Creaste la tabla profiles?)');
                }

                if (profile) {
                    this.userRole.set(profile.role);
                    return { ...data, role: profile.role };
                }
            }

            return { ...data, role: null };
        })());
    }

    logout(): Promise<void> {
        return this.supabase.auth.signOut().then(() => {
            this.currentUser.set(null);
            this.userRole.set(null);
            this.router.navigate(['/login']);
        });
    }

    isLoggedIn(): boolean {
        return !!this.currentUser();
    }

    async createUser(email: string, password: string, role: string, displayName: string) {
        // Create a temporary client to avoid signing out the admin
        const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        // 1. Sign up the user
        const { data, error } = await tempClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            // 2. Assign role and display name in profiles table
            const { error: profileError } = await this.supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    role: role,
                    display_name: displayName,
                    email: email
                });

            if (profileError) {
                // Determine if we should delete the user if profile creation fails? 
                // For now just throw
                throw new Error('User created but failed to assign profile: ' + profileError.message);
            }
        }

        return data;
    }

    async updateUserProfile(id: string, role: string, displayName: string) {
        const { error } = await this.supabase
            .from('profiles')
            .update({
                role,
                display_name: displayName
            })
            .eq('id', id);

        if (error) throw error;
    }

    async deleteUser(id: string) {
        // We delete the profile. 
        // Note: This does NOT delete the user from Supabase Auth (auth.users), 
        // but it removes their access to the app since they won't have a role.
        const { error } = await this.supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    getSupabaseClient() {
        return this.supabase;
    }
}
