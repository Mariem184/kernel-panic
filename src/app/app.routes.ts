import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) }
];