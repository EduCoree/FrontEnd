// import { CenterEdit } from './pages/centers/center-edit/center-edit/center-edit';
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
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
   {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'centers/:id',
    loadComponent: () =>
      import('./pages/centers/center-detail/center-detail/center-detail')
        .then(m => m.CenterDetail)
  },


  {
  path: 'centers/:id/edit',
  loadComponent: () =>
    import('./pages/centers/center-edit/center-edit/center-edit')
      .then(m => m.CenterEdit)
},

{
  path: 'centers/:id/delete',
  loadComponent: () =>
    import('./pages/centers/center-delete/center-delete')
      .then(m => m.CenterDelete)
},

{
  path: 'centers/:id/logo',
  loadComponent: () =>
    import('./pages/centers/center-logo/center-logo')
      .then(m => m.CenterLogo)
}
// ,
//   {
//     path: 'centers/:centerId/categories',
//     loadComponent: () =>
//       import('./pages/')
//         .then(m => m.CategoriesComponent)
//   }
];
