import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logreg-page',
  templateUrl: './logreg-page.component.html',
  styleUrls: ['./logreg-page.component.css']
})
export class LogregPageComponent {
  isActive = false;
  // For Registration Data
  registerData = {
    username: '',
    phone: '',
    email: '',
    password: ''
  };

  // For Login Data
  loginData = {
    email: '',
    password: ''
  };

  
  constructor(private userService: UserService, private router: Router) { }
  
  setActive(status: boolean): void {
    this.isActive = status;
  }
  
  // Registration Logic
  register() {
    //Ensure registerData is valid before submission
    if (this.registerData.username && this.registerData.phone && this.registerData.email && this.registerData.password) {
      this.userService.register(this.registerData).subscribe(
        response => {
          alert('Registration successful!');
          this.setActive(false); // Switch to login after successful registration
        },
        error => alert('Registration failed: E-mail or Username Already In Use')
      );
    } else {
      alert('Please fill out all fields.');
    }
  }

  // Login Logic
  login() {
    if (this.loginData.email && this.loginData.password) {
      this.userService.login(this.loginData).subscribe(
        response => {
          console.log('Login response:', response); // Debugging
          
          // Save the token
          if (response.token) {
            this.userService.saveToken(response.token);
          } else {
            console.error('Token missing in response');
            return;
          }
  
          // Extract user data
          const user = response.user || {}; // Fallback to empty object if 'user' is undefined
          const username = user.username || 'Unknown User'; // Fallback value for username
          const email = user.email || 'Unknown Email'; // Fallback value for email
  
          localStorage.setItem('user', JSON.stringify({ username, email }));
  
          // Navigate based on role
          if (this.userService.isAdmin()) {
            this.router.navigate(['/admin-page']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error => {
          alert('Login failed: E-mail or Password does not exist');
        }
      );
    } else {
      alert('Please fill out both email and password.');
    }
  } 
  
}

