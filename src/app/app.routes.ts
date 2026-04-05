import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth guards/auth.guard';

export const routes: Routes = [
  // Auth Routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },
{
  path: 'teacher/dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/teacher/teacher-dashboard/teacher-dashboard.component')
      .then(m => m.TeacherDashboardComponent)
},
  // Teacher Routes
  {
    path: 'teacher/courses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/my-courses/my-courses.component')
        .then(m => m.MyCoursesComponent)
  },
  {
    path: 'teacher/courses/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/create-course/create-course.component')
        .then(m => m.CreateCourseComponent)
  },
  {
    path: 'teacher/courses/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/teacher/edit-course/edit-course.component')
        .then(m => m.EditCourseComponent)
  },
{
  path: 'teacher/courses/:id/sections',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/courses/pages/teacher/course-sections/course-sections.component')
      .then(m => m.CourseSectionsComponent)
},
  // Default
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];