import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent {

  userData: any = {}; // Store the fetched user data
  username: string | null = ''; // Store the username from the token
  newMessage: string = '';
  chatHistory: any[] = [];
  usernames: any[] = [];
  selectedFriend: any = {};
  unreadMessageCount: any = 0
  messagePollingSubscription: Subscription | null = null;
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor(
    private router: Router,
    private userService: UserService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) { }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnInit(): void {
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

    if (this.selectedFriend.username) {
      // Fetch the chat history only if selectedFriend is set
      this.fetchChatHistory(this.selectedFriend.username);
    }
  }


  sendMessage(): void {
    // Prevent sending empty messages
    if (!this.newMessage.trim()) {
      return;
    }

    // Construct the message object with all required properties
    const message = {
      sender: this.userData.username, // Current user
      receiver: this.selectedFriend.username, // Selected friend
      content: this.newMessage.trim(), // Message content (ensure it's named 'message' to match the backend)
      timestamp: new Date(), // Timestamp of the message
      isRead: false
    };

    this.chatHistory.push(message); // Add the message to the chat history
    // Call the service to send the message to the backend
    this.chatService.sendMessage(message).subscribe(
      (response) => {
        // Optionally handle the response here, such as updating the UI or message status
        this.newMessage = ''; // Clear the input field
      },
      (error) => {
        console.error('Error sending message:', error);
        // Optionally show an error message to the user
      }
    );
  }

  scrollToBottom(): void {
    try {
      const chatContainerElement = this.chatContainer.nativeElement;
      chatContainerElement.scrollTop = chatContainerElement.scrollHeight;
    } catch (error) {
      console.error('Error scrolling to the bottom:', error);
    }
  }

  fetchChatHistory(friendUsername: string): void {
    if (!this.userData.username || !friendUsername) {
      console.error('Invalid user or friend username for fetching chat history.');
      return;
    }

    this.chatService.getChatMessages(this.userData.username, friendUsername).subscribe(
      (messages) => {
        console.log('Fetched messages:', messages); // Log to check if messages are fetched

        // Check if messages are returned
        if (Array.isArray(messages) && messages.length > 0) {
          this.chatHistory = messages; // Update chat history
          console.log('Chat history updated:', this.chatHistory);
        } else {
          console.log('No messages found for this conversation.');
        }
      },
      (error) => {
        console.error('Error fetching chat history:', error);
      }
    );
  }


  // Start polling every 5 seconds to fetch new messages
  startPollingForNewMessages(): void {
    this.messagePollingSubscription = interval(1000).subscribe(() => {
      if (this.selectedFriend?.username) {
        this.fetchChatHistory(this.selectedFriend.username); // Poll for new messages
      }
    });
  }

  markMessagesAsRead(): void {
    console.log('Selected Friend:', this.selectedFriend.username)
    if (!this.selectedFriend) {
      console.error('No chat is currently selected.');
      return;
    }
  
    this.chatService.getChatMessages(this.userData.username, this.selectedFriend.username).subscribe(
      (messages) => {
        // Filter for unread messages
        const unreadMessages = (messages || []).filter((message: { isRead: boolean }) => !message.isRead);
        
        // Get the IDs of unread messages
        const messageIds = unreadMessages.map((message: { _id: string }) => message._id);
  
        if (messageIds.length > 0) {
          // Call the service to mark messages as read
          this.chatService.markMessagesAsRead(this.selectedFriend.chatId, messageIds).subscribe(
            (response) => {
              console.log('Messages marked as read:', response);
  
              // Update local state to reflect changes
              this.chatHistory.forEach(message => {
                if (messageIds.includes(message._id)) {
                  message.isRead = true;
                }
              });
            },
            (error) => {
              console.error('Error marking messages as read:', error);
            }
          );
        } else {
          console.log('No unread messages to mark as read for this chat.');
        }
      },
      (error) => {
        console.error(`Error fetching messages for ${this.selectedFriend.username}:`, error);
      }
    );
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
  
  

  selectFriend(friend: any): void {
    this.selectedFriend = friend;
    this.newMessage = ''; // Clear input for new friend
    this.fetchChatHistory(friend.username); // Fetch messages for the selected friend
    this.markMessagesAsRead()
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