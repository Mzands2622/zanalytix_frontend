import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="center-content">
      <h1>ZANALYTIX</h1>
      <div class="buttons">
        <button routerLink="/login">Login</button>
        <button routerLink="/signup">Sign Up</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: black;
    }
    .center-content {
      text-align: center;
      color: white;
    }
    h1 {
      font-size: 4em;
      margin-bottom: 20px;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 1.2em;
      color: white;
      background-color: transparent;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s, color 0.3s;
    }
    button:hover {
      background-color: white;
      color: black;
    }
  `]
})
export class HomepageComponent {}