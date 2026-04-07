import { Categories } from './pages/centers/categories/categories';
// import { CenterEdit } from './pages/centers/center-edit/center-edit/center-edit';
import { Routes } from '@angular/router';
import { CreateQuizComponent } from './pages/Quizzes/CreateQuiz/create-quiz/create-quiz';
import { authGuard } from './core/guards/auth guards/auth.guard';
import { TeacherProfileComponent } from './pages/teacher-profile/teacher-profile';
import { ProfileComponent } from './pages/profile/profile';
import { AdminTeachersComponent } from './pages/admin-teachers/admin-teachers';
import { AdminStudentsComponent } from './pages/admin-students/admin-students';
import { AdminStudentDetailComponent } from './pages/admin-student-detail/admin-student-detail';

export const routes: Routes = [
   
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
},
{
        path: 'teacher/courses/:courseId/quizzes',
         loadComponent: () =>CreateQuizComponent
  },
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
    import('./pages/teacher/course-sections/course-sections.component')
      .then(m => m.CourseSectionsComponent)
    },

// Content Delivery: Lesson Manager
{
  path: 'teacher/courses/:courseId/lessons/:lessonId',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/teacher/lesson-manager/lesson-manager.component')
      .then(m => m.LessonManagerComponent),
  title: 'Lesson Manager — EduCore',
},

// Content Delivery: Media Page (wired)
{
  path: 'teacher/courses/:id/media',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/lessons/course-media/course-media.component')
      .then(m => m.CourseMediaComponent),
  title: 'Course Media — EduCore',
},

//hala
{
  path: 'admin/teachers',
  component: AdminTeachersComponent,
  title: 'Teachers — Admin',
},
{
  path: 'admin/students',
  component: AdminStudentsComponent,
  title: 'Students — Admin',
},
{
  path: 'admin/students/:id',
  component: AdminStudentDetailComponent,
  title: 'Student Detail — Admin',
},



















//menna



{
  path: 'centers/:centerId/categories',
  loadComponent: () =>
    import('./pages/centers/categories/categories')
      .then(m => m.Categories)
}




















//samir











//tawfik

















//badr


















//obad



















// ,
//   {
//     path: 'centers/:centerId/categories',
//     loadComponent: () =>
//       import('./pages/')
//         .then(m => m.CategoriesComponent)
//   }
];
