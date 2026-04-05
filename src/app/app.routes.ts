import { Routes } from '@angular/router';
import { TeacherProfileComponent } from './pages/teacher-profile/teacher-profile';
import { ProfileComponent } from './pages/profile/profile';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: Home },
    {
    path: 'profile',
    component: ProfileComponent,
    // canActivate: [authGuard],
    title: 'My Profile — EduCore',
  },
  {
    path: 'teachers/:id',
    component: TeacherProfileComponent,
    title: 'Teacher Profile — EduCore',
  },
];
