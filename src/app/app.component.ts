import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeLoanComponent } from "./components/home-loan/home-loan.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeLoanComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'home-loan';
}
