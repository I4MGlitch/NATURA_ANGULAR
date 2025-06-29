import { Component } from '@angular/core';
import { EducationalContentService } from '../services/educational-content.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-educational-content-detail-page',
  templateUrl: './educational-content-detail-page.component.html',
  styleUrls: ['./educational-content-detail-page.component.css']
})
export class EducationalContentDetailPageComponent {

  ContentId: string | null = null;
  educationalContentDetail: any;
  userData: any = {};  // Store the fetched user data
  username: string | null = '';  // Store the username from the token
  chatHistory: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];


  constructor(private userService: UserService, private sanitizer: DomSanitizer,private chatService: ChatService, private educationalContentService: EducationalContentService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
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

    this.route.params.subscribe(params => {
      this.ContentId = params['id'];
      console.log('Educational Content:', this.ContentId);
      if (this.ContentId !== null) {
        this.educationalContentService.fetchSpecificEducationalContent(this.ContentId).subscribe(
          (details: any) => {
            this.educationalContentDetail = details;
            console.log('Educational Content details:', this.educationalContentDetail);
          },
          error => {
            console.error('Error getting Educational Content details:', error);
          }
        );
      } else {
        console.error('Educational Content ID is null.');
      }
    });
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      const embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return '';  // Return an empty string if it's not a valid YouTube URL
  }

  // Handle image error event
  handleImageError(event: any, product: any): void {
    console.error('Image loading error for product:', product, event);
    product.errorImage = true;
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

  logout(): void {
    localStorage.removeItem('token');  // Remove token to log out
    localStorage.removeItem('user');   // Remove user data from localStorage
    this.router.navigate(['/logreg-page']);  // Navigate to the login page
  }

}
