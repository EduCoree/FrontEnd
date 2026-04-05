import { Navbar } from './shared/components/ui/navbar/navbar';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite/flowbite';
import { initFlowbite } from 'flowbite';
import { Home } from './pages/home/home';
import { CreateQuizComponent } from "./pages/Quizzes/CreateQuiz/create-quiz/create-quiz";





@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Home, CreateQuizComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
    constructor(private flowbiteService: FlowbiteService) {}

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
}
