import { Routes } from '@angular/router';
import { CreateQuizComponent } from './pages/Quizzes/CreateQuiz/create-quiz/create-quiz';

export const routes: Routes = [
    {
        path: 'teacher/courses/:courseId/quizzes',
         loadComponent: () =>CreateQuizComponent
  },
  
];
