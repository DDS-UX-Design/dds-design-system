import { Component } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';

@Component({
  selector: 'app-typography-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './typography-page.component.html',
  styleUrl: './typography-page.component.css'
})
export class TypographyPageComponent {}