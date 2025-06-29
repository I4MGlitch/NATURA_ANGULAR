import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { EducationalContentService } from '../services/educational-content.service';
import { GoalService } from '../services/goal.service';
declare var Swiper: any;

@Component({
  selector: 'app-actions-page',
  templateUrl: './actions-page.component.html',
  styleUrls: ['./actions-page.component.css']
})
export class ActionsPageComponent {

  userData: any = {}; // Store the fetched user data
  username: string | null = ''; // Store the username from the token
  newMessage: string = '';
  usernames: any[] = [];
  chatHistory: any[] = [];
  goals: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];
  educationalContentList: any = {};

  constructor(
    private router: Router,
    private userService: UserService,
    private chatService: ChatService,
    private educationalContentService: EducationalContentService,
    private ngZone: NgZone,
    private goalService: GoalService,
    private route: ActivatedRoute
  ) { }

  ngAfterViewInit(): void {

  }
  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const swiper1 = new Swiper('.container1', {
        slidesPerView: 2,
        spaceBetween: 30,
        loop: true,
        pagination: {
          el: '.swiper-pagination1',
          clickable: true,
          dynamicBullets: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          968: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          1330: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
        },
      });
      const swiper2 = new Swiper('.container2', {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        pagination: {
          el: '.swiper-pagination2',
          clickable: true,
          dynamicBullets: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1330: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }
      });

    });

    if (!this.userService.isLoggedIn()) {
      console.error('User is not logged in. Redirecting to logreg-page.');
      this.router.navigate(['/logreg-page']);
      return;
    }

    this.username = this.userService.getUsernameFromToken();

    if (this.username) {
      this.fetchUserData(this.username);
      this.fetchAllUsernames();
    } else {
      console.error('Username not found in the token.');
    }
    this.fetchAllGoals()
    this.fetchAllEducationalContent()
  }

  getUserRepetition(goal: any): number | undefined {
    // Find the repetition for the current user
    const progression = goal.progression?.find(
      (p: { username: string; repetition: number }) => 
        p.username === this.userData.username
    );
    return progression?.repetition;
  }

  getUnreadMessages(friendUsername: string): number {
    const chatHistory = this.allChatHistory.find(chat => chat.username === friendUsername);

    if (chatHistory) {
      // Filter messages where isRead is false and sender is not the current user
      return chatHistory.messages.filter(message => !message.isRead && message.sender !== this.userData.username).length;
    }

    return 0;
  }

  getUserProgress(goal: any): number {
    // Assuming 'currentUser' is the logged-in user object
    const userProgress = goal.progression?.find((p: { username: any; }) => p.username === this.userData.username);
    return userProgress ? userProgress.percentage : 0;
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

  fetchAllGoals(): void {
    this.goalService.fetchAllGoals().subscribe(
      (response) => {
        this.goals = response;
        console.log('Fetched all goal:', this.goals);
      },
      (error) => {
        console.error('Error fetching all goal:', error);
      }
    );
  }

  fetchAllEducationalContent(): void {
    this.educationalContentService.fetchAllEducationalContent().subscribe(
      (response) => {
        this.educationalContentList = response;
        console.log('Fetched all educational content:', this.educationalContentList);
      },
      (error) => {
        console.error('Error fetching all educational content:', error);
      }
    );
  }

  fetchUserData(username: string): void {
    this.userService.getUserByUsername(username).subscribe(
      (data) => {
        this.userData = data;
        this.fetchAllChatHistory()
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  fetchAllUsernames(): void {
    this.userService.fetchAllUsernames().subscribe(
      (response) => {
        this.usernames = response;
      },
      (error) => {
        console.error('Error fetching all usernames:', error);
      }
    );
  }

  getProfilePic(username: string): string {
    // Find the friend based on the username
    const friend = this.usernames.find((user: { username: string; }) => user.username === username);

    // Check if the friend exists and has a profile picture with a valid content type
    if (friend && friend.profilePic && friend.profilePic[0]?.data && friend.profilePic[0]?.contentType) {
      return this.getImageUrl(friend.profilePic[0].data);
    } else if (this.userData && this.userData.profilePic && this.userData.profilePic[0]?.data && this.userData.profilePic[0]?.contentType) {
      // If it's the current user and they have a valid profile picture, return it
      return this.getImageUrl(this.userData.profilePic[0].data);
    } else {
      // Return a default error image if no profile picture exists or content type is missing
      return this.getErrorImageUrl();
    }
  }

  getErrorImageUrl(): string {
    return '/assets/profile.png';
  }

  getImageUrl(imageData: any): string {
    if (imageData?.data) {
      const blob = new Blob([new Uint8Array(imageData.data)], { type: imageData.contentType });
      return URL.createObjectURL(blob);
    }
    return this.getErrorImageUrl();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/logreg-page']);
  }
}
