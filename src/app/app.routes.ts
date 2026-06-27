import { Routes } from '@angular/router';
import { Room } from './room/room';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'room', component: Room },
  { path: '**', redirectTo: 'home' }
];
