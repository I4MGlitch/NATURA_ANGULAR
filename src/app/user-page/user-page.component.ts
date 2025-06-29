import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { PostService } from '../services/post.service';
import { GoalService } from '../services/goal.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent {
  userData: any = {}; // Store the fetched user data
  username: string | null = ''; // Store the username from the token
  usernames: any[] = [];
  chatHistory: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];
  userId: string = '';
  userProfile: any;
  isFriendAdded: boolean = false;
  posts: any = {};
  goals: any = {};
  activePost: any = {
    username: '',
    commentCount: 0,
    like: [],
    comments: []
  }
  createPostData: any = {
    description: '',
    pictures: '',
  };
  newComment: any = ''

  constructor(
    private router: Router,
    private userService: UserService,
    private chatService: ChatService,
    private postService: PostService,
    private goalService: GoalService,
    private route: ActivatedRoute,
  ) { }

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
    this.route.params.subscribe(params => {
      this.userId = params['username'];
      console.log('User Profile:', this.userId);
      if (this.userId !== null) {
        this.userService.getUserByUsername(this.userId).subscribe(
          (details: any) => {
            this.userProfile = details;
            console.log('User Profile details:', this.userProfile);
            this.fetchPosts()
            this.fetchAllGoals()
          },
          error => {
            console.error('Error getting User Profile details:', error);
          }
        );
      } else {
        console.error('User ID is null.');
      }
    });    
  }

  isFriend(friendUsername: string): boolean {
    // Check if the current user is already in the friendList
    return this.userData.friendList && this.userData.friendList.some((friend: { username: string; }) => friend.username === friendUsername);
  }
  

  getUnreadMessages(friendUsername: string): number {
    const chatHistory = this.allChatHistory.find(chat => chat.username === friendUsername);

    if (chatHistory) {
      // Filter messages where isRead is false and sender is not the current user
      return chatHistory.messages.filter(message => !message.isRead && message.sender !== this.userData.username).length;
    }

    return 0;
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

  isGoalValidForUser(goal: any): boolean {
    // Check if progression exists and contains a valid username with repetition > 0
    return goal.progression?.some(
      (p: { username: string; repetition: number }) => 
        p.username === this.userId && p.repetition > 0
    );
  }
  
  getUserRepetition(goal: any): number | undefined {
    // Find the repetition for the current user
    const progression = goal.progression?.find(
      (p: { username: string; repetition: number }) => 
        p.username === this.userId
    );
    return progression?.repetition;
  }
  
  
  fetchPosts(username: string | null = this.userProfile.username): void {
    const validUsername = username || this.userId; // Use fallback if username is null

    this.postService.fetchPostsByUsername(validUsername).subscribe(
      (response) => {
        this.posts = response;
        console.log('Fetched posts:', this.posts);
      },
      (error) => {
        console.error('Error fetching posts:', error);
      }
    );
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
    this.userService.getUserByUsername(username).subscribe(
      (data) => {
        this.userData = data;
        this.fetchAllChatHistory()
        this.fetchPosts()
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

  addFriend(friendUsername: string) {
    this.userService.addFriend(this.userData.username, friendUsername).subscribe(
      (response) => {
        this.isFriendAdded = true;
        alert('Friend added successfully!');
        this.fetchAllUsernames();  // Reload user data or update friend list as needed
      },
      (error) => {
        console.error('Error adding friend:', error);
        alert(error.error.message || 'Error adding friend');
      }
    );
  }

  onLike(postId: string, username: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent modal opening

    this.postService.likePost(postId, username).subscribe({
      next: (response) => {
        // Update the likes count in the local posts array
        const post = this.posts.find((p: { _id: any; }) => p._id === postId);
        if (post) {
          post.like = response.likes; // Update the likes array with the latest data
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      },
    });
  }

  onAddComment(postId: string, username: string, comment: string): void {
    if (!comment.trim()) {
      console.log('Empty adding comment')
      return; // Avoid empty comments
    }

    this.postService.addComment(postId, username, comment).subscribe({
      next: (response) => {
        // Update the comments array in the local posts array
        const post = this.posts.find((p: { _id: any; }) => p._id === postId);
        if (post) {
          post.comments = response.comments; // Update comments with the latest data
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      },
    });
  }

  openPostModal(post: any): void {
    // Open modal programmatically
    const modalElement = document.getElementById('postModal');

    if (modalElement) {
      // Set the active post details for display
      this.activePost = post;
      console.log(this.activePost.comments);
      this.activePost.commentCount = post.comments.length
      modalElement.style.display = 'block';
    }
  }

  getProfilePic(username: string): string {
    // Find the user based on the username from the comments
    const user = this.usernames.find((user: { username: string }) => user.username === username);

    // Check if the user exists and has a profile picture with a valid content type
    if (user && user.profilePic && user.profilePic[0]?.data && user.profilePic[0]?.contentType) {
      return this.getImageUrl(user.profilePic[0].data);
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
