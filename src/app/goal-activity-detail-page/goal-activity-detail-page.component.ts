import { Component } from '@angular/core';
import { GoalService } from '../services/goal.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-goal-activity-detail-page',
  templateUrl: './goal-activity-detail-page.component.html',
  styleUrls: ['./goal-activity-detail-page.component.css']
})
export class GoalActivityDetailPageComponent {
  goalId: string | null = null;
  goalsDetail: any = {};
  userData: any = {};  // Store the fetched user data
  username: string | null = '';  // Store the username from the token
  progress: number = 0;
  showCongratsModal: boolean = false;
  chatHistory: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];


  constructor(
    private router: Router,
    private goalService: GoalService,
    private userService: UserService,
    private route: ActivatedRoute,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    console.log('Component initialized.');

    if (!this.userService.isLoggedIn()) {
      console.error('User is not logged in. Redirecting to logreg-page.');
      this.router.navigate(['/logreg-page']);
      return; // Stop further initialization
    }

    // Get the username from the JWT token
    this.username = this.userService.getUsernameFromToken();
    console.log('Decoded username:', this.username);

    // Fetch user data if the username exists
    if (this.username) {
      this.fetchUserData(this.username);
    } else {
      console.error('Username not found in the token.');
    }

    // Fetch goal details based on goalId
    this.route.params.subscribe(params => {
      this.goalId = params['id'];
      console.log('Goal Content:', this.goalId);
      if (this.goalId !== null) {
        this.goalService.fetchSpecificGoal(this.goalId).subscribe(
          (details: any) => {
            this.goalsDetail = details;
            console.log('Goal details:', this.goalsDetail);

            // Ensure progression is initialized
            if (!this.goalsDetail.progression) {
              this.goalsDetail.progression = []; // Initialize progression if undefined
            }

            // Initialize user progression if not found
            const userProgress = this.goalsDetail.progression.find((p: { username: string | null; }) => p.username === this.username);
            if (!userProgress) {
              this.goalsDetail.progression.push({
                username: this.username,
                listObj: [],
                percentage: 0,
                repetition: 0
              });
            }

            // Update the progress bar
            this.updateProgressBar(this.calculateProgress(userProgress));
          },
          error => {
            console.error('Error getting Goal details:', error);
          }
        );
      } else {
        console.error('Goal ID is null.');
      }
    });
  }

  getUnreadMessages(friendUsername: string): number {
    const chatHistory = this.allChatHistory.find(chat => chat.username === friendUsername);

    if (chatHistory) {
      // Filter messages where isRead is false and sender is not the current user
      return chatHistory.messages.filter(message => !message.isRead && message.sender !== this.userData.username).length;
    }

    return 0;
  }

  fetchAllChatHistory(): void {
    console.log('Fetching all chat history...');
    this.allChatHistory = []; // Clear the history before fetching
    let totalUnreadMessages = 0; // Initialize the unread message counter
  
    if (!this.userData.friendList || this.userData.friendList.length === 0) {
      console.error('Friend list is empty or undefined.');
      return;
    }
  
    // Fetch chat history for each friend
    this.userData.friendList.forEach((friend: { username: string }) => {
      this.chatService.getChatMessages(this.userData.username, friend.username).subscribe(
        (messages) => {
          const chatHistory = {
            username: friend.username,
            messages: messages || [] // Use an empty array if messages are undefined
          };
  
          // Count unread messages in this friend's chat history excluding those sent by the current user
          const unreadMessages = chatHistory.messages.filter(
            (message: { isRead: boolean; sender: string }) => !message.isRead && message.sender !== this.userData.username
          ).length;
          totalUnreadMessages += unreadMessages;
  
          console.log(`Fetched history for ${friend.username}:`, chatHistory);
          console.log(`Unread messages for ${friend.username}: ${unreadMessages}`);
  
          // Add to the allChatHistory array
          this.allChatHistory.push(chatHistory);
        },
        (error) => {
          console.error(`Error fetching messages for ${friend.username}:`, error);
        }
      );
    });
  
    // Log the total unread messages
    setTimeout(() => {
      console.log('Total unread messages:', totalUnreadMessages);
      this.unreadMessageCount = totalUnreadMessages; // Update the total unread messages count
    }, 1000); // Delay to ensure all chat histories are processed
  }

  fetchUserData(username: string): void {
    console.log('Fetching data for username:', username);
    this.userService.getUserByUsername(username).subscribe(
      data => {
        this.userData = data;  // Store the fetched user data
        this.fetchAllChatHistory()
        console.log('User data fetched successfully:', this.userData);
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  // Calculate the progress percentage
  calculateProgress(userProgress: any): number {
    if (!userProgress || !userProgress.listObj) {
      return 0; // No objectives completed, 0% progress
    }

    const totalObjectives = this.goalsDetail.objective?.length || 0;
    const completedObjectives = userProgress.listObj.length;

    return Math.round((completedObjectives / totalObjectives) * 100);
  }

  updateProgressBar(percentage: number): void {
    const progressBar = document.getElementById('progress-bar') as HTMLElement;
    const progressText = document.getElementById('progress-text') as HTMLElement;

    if (progressBar && progressText) {
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;
    }
  }

  // Update the objective status and check for 100% progress
  updateObjectiveStatus(objectiveName: string, isChecked: boolean): void {
    if (this.username && this.goalId) {
      this.goalService.updateProgression(this.goalId, objectiveName, isChecked, this.username).subscribe(
        (response: any) => {
          console.log('Updated goal data:', response.data);
          if (response.data) {
            this.goalsDetail = response.data;  // Update the goal data
            const newPercentage = response.data.progression.find((p: { username: string | null; }) => p.username === this.username)?.percentage;
            console.log('New Progress Percentage:', newPercentage);
            if (newPercentage !== undefined) {
              this.updateProgressBar(newPercentage);  // Update the progress bar with the new percentage
              if (newPercentage === 100) {
                this.showCompletionModal();  // Show congratulation modal if progress reaches 100%
              }
            }
          }
        },
        (error) => {
          console.error('Error updating progression:', error);
        }
      );
    }
  }

  // Update checkbox state based on progression
  updateCheckboxState(objectiveName: string): void {
    const userProgression = this.goalsDetail.progression.find((p: { username: string | null; }) => p.username === this.username);
    if (userProgression) {
      const isCompleted = userProgression.listObj.some((o: { comObj: string; }) => o.comObj === objectiveName);
      // Update the checkbox state based on the objective completion
      this.isObjectiveCompleted(objectiveName);  // Use this to bind checkbox checked state
    }
  }

  isObjectiveCompleted(objectiveName: string): boolean {
    const userProgression = this.goalsDetail.progression.find((p: { username: string | null; }) => p.username === this.username);
    return userProgression ? userProgression.listObj.some((o: { comObj: string; }) => o.comObj === objectiveName) : false;
  }

  showCompletionModal(): void {         
      this.showCongratsModal = true;
      this.resetProgress();  // Reset progress if needed or handle further    
  }

  resetProgress(): void {
    this.goalService.resetUserProgress(this.goalsDetail._id, this.userData.username).subscribe(
      response => {
        console.log('Progress reset successfully:', response);
        // Optionally, handle any UI changes after reset
      },
      error => {
        console.error('Error resetting progress:', error);
      }
    );
  }

  resetToZero(): void {
    this.goalsDetail.progression.forEach((progression: any) => {
      if (progression.username === this.username) {
        progression.percentage = 0;
        progression.listObj = [];  // Clear the completed objectives list
      }
    });
    this.goalService.updateProgression(this.goalsDetail._id, '', true, this.userData.username).subscribe();
  }

  // Method to close the congratulation modal
  closeCongratsModal(): void {
    this.showCongratsModal = false;
  }

  addProgressionToGoal(): void {
    if (this.goalsDetail && this.goalsDetail._id) {
      this.goalService.addProgression(this.goalsDetail._id, this.userData.username).subscribe(
        (response) => {
          console.log(response);
          this.updateProgressBar(response.data);  // Update the progress bar if needed
        },
        (error) => {
          console.error(error);
          console.log('Progression already exists for this user!');
        }
      );
    }
  }

  // Handle image error event for profile picture
  getErrorImageUrl(): string {
    return '/assets/profile.png';
  }

  // Get image URL from image data (Base64 or Blob)
  getImageUrl(imageData: any): string {
    if (imageData && imageData.data) {
      const blob = new Blob([new Uint8Array(imageData.data)], { type: imageData.contentType });
      return URL.createObjectURL(blob);
    }
    return this.getErrorImageUrl();
  }

  logout(): void {
    localStorage.removeItem('token');  // Remove token to log out
    localStorage.removeItem('user');   // Remove user data from localStorage
    this.router.navigate(['/logreg-page']);  // Navigate to the login page
  }
}
