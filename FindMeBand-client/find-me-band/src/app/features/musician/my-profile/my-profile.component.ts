import { Component, inject } from '@angular/core';
import { MyProfileService } from '../../../core/services/my-profile.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {
  readonly s = inject(MyProfileService);
}
