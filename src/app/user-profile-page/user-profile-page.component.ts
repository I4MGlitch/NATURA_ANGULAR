import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivityLogService } from '../services/activity-log.service';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { ChatService } from '../services/chat.service';
import { GoalService } from '../services/goal.service';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.css']
})
export class UserProfilePageComponent {

  posts: any = {};
  goals: any = {};
  userData: any = {};  // Store the fetched user data
  username: string | null = '';  // Store the username from the token
  activityLog: any = {
    username: this.username,
    date: this.getCurrentDate(),
    transportationModes: '',
    distanceTraveled: null,
    fuelType: '',
    fuelConsumption: null,
    energySource: '',
    energyConsumption: null,
    foodType: '',
    foodQuantity: null,
    transportationEmission: null,
    energyEmission: null,
    mealsEmission: null,
    totalEmission: null
  };
  createPostData: any = {
    description: '',
    pictures: '',
  };
  imagePreview: string | null = '';
  usernames: any = {};
  tempUsernames: any = {};
  filteredUsernames: string[] = [];
  searchQuery: string = '';
  isFriendAdded: boolean = false;
  selectedImages: File[] = [];
  selectedImagesBase64: string[] = [];
  activePost: any = {
    username: '',
    commentCount: 0,
    like: [],
    comments: []
  }
  activeAchievement: any = {
    title:  ''
  }
  picChange: boolean = false
  newComment: any = ''
  chatHistory: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];


  // Example constants for carbon intensity (replace with actual values)
  carbonIntensityOfFuel: { [key: string]: number } = {
    'Pertamax': 1.5,
    'Pertalite': 2.0,
    'Solar': 2.5
  };

  carbonIntensityOfEnergySource: { [key: string]: number } = {
    'Hydropower': 0.05,
    'Coals': 1,
    'Natural Gas': 0.6
  };

  carbonFootprintFactor: { [key: string]: number } = {
    'Plant-based': 0.5,
    'Animal-based': 2.0,
    'Processed food': 2.5
  };

  constructor(private userService: UserService, private goalService: GoalService  , private chatService: ChatService, private activityLogService: ActivityLogService, private router: Router, private postService: PostService) { }

  ngOnInit(): void {
    console.log('Component initialized.');

    // Get the username from the JWT token
    this.username = this.userService.getUsernameFromToken();
    console.log('Decoded username:', this.username);
    this.fetchAllUsernames()
    this.fetchPosts(this.username)

    // Fetch user data if the username exists
    if (this.username) {
      this.fetchUserData(this.username);
      this.fetchAllGoals();
    } else {
      console.error('Username not found in the token.');
    }
  }

  fetchAllUsernames(): void {
    this.userService.fetchAllUsernames().subscribe(
      (response) => {
        this.usernames = response;
        this.tempUsernames = response;
        console.log('Fetched all username:', this.usernames);
      },
      (error) => {
        console.error('Error fetching all username:', error);
      }
    );
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Filter usernames based on the search query (case insensitive)
      this.usernames = this.usernames.filter((username: { username: string; }) =>
        username.username.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If no search query, reset to original list or fetch from the database
      this.resetUsernames(); // Replace with a method to reset or re-fetch the data
    }
  }

  resetUsernames(): void {    
    this.usernames = [...this.tempUsernames]; // Assuming `allUsernames` is the original list
  }

  // Fetch user data by username
  fetchUserData(username: string): void {
    console.log('Fetching data for username:', username);
    this.userService.getUserByUsername(username).subscribe(
      data => {
        this.userData = data;  // Store the fetched user data
        console.log('User data fetched successfully:', this.userData);
        this.fetchAllChatHistory()
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  isGoalValidForUser(goal: any): boolean {
    // Check if progression exists and contains a valid username with repetition > 0
    return goal.progression?.some(
      (p: { username: string; repetition: number }) => 
        p.username === this.userData.username && p.repetition > 0
    );
  }
  
  getUserRepetition(goal: any): number | undefined {
    // Find the repetition for the current user
    const progression = goal.progression?.find(
      (p: { username: string; repetition: number }) => 
        p.username === this.userData.username
    );
    return progression?.repetition;
  }
  
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  onSubmit(): void {
    // Ensure username is included in the update
    if (this.username) {
      this.userData.username = this.username;
    }
  
    // Check if a new profile picture is provided (picChange is true)
    if (this.picChange) {
      // Proceed to submit the updated profile picture
      console.log('New profile picture detected, including in the update.');
    } else {
      // If no new profile picture is provided, ensure profilePic is not included
      this.userData.profilePic = undefined;
      console.log('No new profile picture, keeping the existing one.');
    }
  
    // Submit the user data with or without updated profile picture
    this.userService.updateUserProfile(this.userData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        alert('Profile updated successfully')
        window.location.reload();
        // Optionally handle success actions after the update
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
  

  // Calculate emissions based on the formulas
  calculateEmissions(): void {
    // Calculate transportation emissions
    const fuelEmission = this.activityLog.distanceTraveled * (this.activityLog.fuelConsumption / 100) * this.carbonIntensityOfFuel[this.activityLog.fuelType];
    this.activityLog.transportationEmission = fuelEmission;

    // Calculate energy emissions
    const energyEmission = this.activityLog.energyConsumption * this.carbonIntensityOfEnergySource[this.activityLog.energySource];
    this.activityLog.energyEmission = energyEmission;

    // Calculate food emissions
    const mealsEmission = this.activityLog.foodQuantity * this.carbonFootprintFactor[this.activityLog.foodType];
    this.activityLog.mealsEmission = mealsEmission;

    // Calculate total emissions
    this.activityLog.totalEmission = this.activityLog.transportationEmission + this.activityLog.energyEmission + this.activityLog.mealsEmission;
    console.log('Emissions calculated:', this.activityLog);
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

  onFileChange(event: any): void {
    const file = event.target.files[0]; // Assuming one file for profile picture

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result as string; // The base64 string of the image

        // Update userData with the appropriate profilePic structure
        this.userData.profilePic = {
          contentType: file.type,
          data: {
            $binary: {
              base64: base64Image.split(',')[1], // Extract the base64 part (without 'data:image/png;base64,')
              subType: "00"
            }
          }
        };

        // Preview the image by storing the base64 string
        this.imagePreview = base64Image; // Store the full base64 string for preview
        this.picChange = true
      };

      reader.readAsDataURL(file); // Convert the file to base64
    }
  }

  onFileChangePost(event: any): void {
    this.selectedImages = [];
    this.selectedImagesBase64 = [];
    const files = event.target.files;

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedImages.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Data = e.target.result;
          this.selectedImagesBase64.push(base64Data);

          // Set the first image as the preview
          if (i === 0) {
            this.imagePreview = base64Data;
          }
        };
        reader.readAsDataURL(file); // Convert the file to a Base64 string
      }
    } else {
      // Clear selections if no file is selected
      this.imagePreview = null;
      this.selectedImages = [];
      this.selectedImagesBase64 = [];
    }
  }

  onFileChangeAchievement(event: any): void {
    this.selectedImages = [];
    this.selectedImagesBase64 = [];
  
    if (event && event.target.files.length > 0) {
      // Handle file upload
      const files = event.target.files;
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedImages.push(file);
  
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Data = e.target.result;
          this.selectedImagesBase64.push(base64Data);
  
          // Set the first uploaded image as the preview
          if (i === 0) {
            this.imagePreview = base64Data;
          }
        };
        reader.readAsDataURL(file); // Convert the file to a Base64 string
      }
    } else if (this.activeAchievement?.pictures?.length > 0) {
      // Fallback: Use activeAchievement pictures if no file is selected
      const firstPicture = this.activeAchievement.pictures[0];
  
      if (firstPicture && firstPicture.data) {
        // Assume getImageUrl() converts data to a proper Base64 image URL
        this.imagePreview = this.getImageUrl(firstPicture.data);
        this.selectedImagesBase64 = [this.imagePreview];
      }
    } else {
      // Clear selections if no file is selected and no activeAchievement pictures
      this.imagePreview = null;
      this.selectedImages = [];
      this.selectedImagesBase64 = [];
    }
  }
  

  fetchPosts(username: string | null = this.username): void {
    const validUsername = username || ''; // Use fallback if username is null

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

  openAchievementModal(goal: any): void {
    // Open modal programmatically
    const modalElement = document.getElementById('uploadAchievementModal');
  
    if (modalElement) {
      // Set the active achievement details for display
      this.activeAchievement = goal;
      console.log('Achievement:', this.activeAchievement);
  
      // Clear selected images before pushing new ones
      this.selectedImages = [];
      this.selectedImagesBase64 = [];
      console.log('Cleared selectedImages and selectedImagesBase64.');
  
      // Check if pictures exist for the active achievement
      if (this.activeAchievement?.pictures?.length > 0) {
        console.log('Pictures found for active achievement:', this.activeAchievement.pictures);
  
        // Push each picture data into selectedImages array and convert it to Base64
        this.activeAchievement.pictures.forEach((picture: { data: any }) => {
          console.log('Pushing picture data:', picture.data);
  
          this.selectedImages.push(picture.data);
          this.selectedImagesBase64.push(this.getImageUrl(picture.data));
  
          console.log('Current selectedImages:', this.selectedImages);
          console.log('Current selectedImagesBase64:', this.selectedImagesBase64);
        });
  
        // Set the first image as the preview image
        this.imagePreview = this.selectedImagesBase64[0] || null;
        console.log('Image preview set to:', this.imagePreview);
      } else {
        // If no pictures exist, clear the preview and selected images
        console.log('No pictures found for active achievement.');
        this.selectedImages = [];
        this.selectedImagesBase64 = [];
        this.imagePreview = null;
      }
  
      // Set the default description dynamically
      this.createPostData.description = `🎯 ${this.activeAchievement?.title || ''}  
  🏆 Congratulations! This achievement has been successfully completed ${this.getUserRepetition(this.activeAchievement) || 0} times.  
  Keep up the excellent progress and aim for even greater accomplishments! 🚀✨`;
  
      console.log('Description set to:', this.createPostData.description);
  
      // Display the modal
      modalElement.style.display = 'block';
      console.log('Modal displayed.');
    } else {
      console.log('Modal element not found.');
    }
  }

  createAchievement(): void {
    if (!this.createPostData.description) {
      console.error('Description is required.');
      return;
    }

    // Call the service to create the post with the activeAchievement's pictures
    if (this.activeAchievement) {
      this.postService.createAchievement(this.activeAchievement._id, this.userData.username, this.createPostData.description)
        .subscribe(
          (response) => {
            console.log('Post created successfully:', response);
            alert('Post created successfully');
          },
          (error) => {
            console.error('Error creating post:', error);
          }
        );
    } else {
      console.error('Active achievement is not set.');
    }
  }
  
        
  updateUserProfile(picChange= this.picChange): void {
    // Clone userData to avoid direct mutation
    const dataToUpdate = { ...this.userData };
    console.log('Profile Change:', picChange);
  
    // Only include profilePic in the update if picChange is true
    if (!picChange) {
      console.log('No picture change, omitting profilePic.');
      delete dataToUpdate.profilePic;  // Explicitly delete profilePic when no change
    }
  
    console.log('Data to update:', dataToUpdate); // Check if profilePic is included or omitted
  
    // Proceed with the update request
    this.userService.updateUserProfile(dataToUpdate).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
  
  

  // onSearch(): void {
  //   const query = this.searchQuery.toLowerCase();
  //   this.filteredUsernames = this.usernames.filter((username: string) =>
  //     username.toLowerCase().includes(query)
  //   );
  //}

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

  getProfilePicComment(username: string): string {
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

  removeFriend(friendUsername: string): void {
    this.userService.removeFriend(this.userData.username, friendUsername).subscribe(
      (response) => {
        console.log('Friend removed successfully:', response);
        // Update the local friend list to reflect the removal
        this.userData.friendList = this.userData.friendList.filter(
          (friend: { username: string; }) => friend.username !== friendUsername
        );
      },
      (error) => {
        console.error('Error removing friend:', error);
      }
    );
  }  
    createPost(): void {
    // Check if the description is entered
    if (!this.createPostData.description) {
      console.error('Description is required.');
      return;
    }

    // Check if there are any images selected
    if (this.selectedImages.length === 0) {
      console.error('Please select at least one image.');
      return;
    }

    // Prepare FormData for submission
    const formData = new FormData();

    // Append each selected image to the FormData
    for (let i = 0; i < this.selectedImages.length; i++) {
      formData.append('pictures', this.selectedImages[i]);
    }

    // Append the other post fields
    formData.append('username', this.userData.username);
    formData.append('description', this.createPostData.description);

    // Make the HTTP request using the service
    this.postService.createPost(formData).subscribe(
      (response: any) => {
        console.log('Post created successfully:', response);
        alert('Post created successfully')  
      },
      (error: any) => {
        console.error('Error creating post:', error);
      }
    );
  }

  submitActivity(): void {
    // Calculate emissions before submitting activity log
    this.calculateEmissions();

    // Assign the username to 'owned' from the token
    const owned: any = this.userService.getUsernameFromToken();
    console.log('Activity By Username (owned):', owned);

    // Prepare the activity log data to be sent to the backend
    const activityData = {
      username: owned,  // Use the 'owned' variable for the username
      date: this.activityLog.date,
      transportationModes: this.activityLog.transportationModes,
      energyUsage: this.activityLog.energySource,
      meals: this.activityLog.foodType,
      transportationEmission: this.activityLog.transportationEmission,
      energyEmission: this.activityLog.energyEmission,
      mealsEmission: this.activityLog.mealsEmission,
      totalEmission: this.activityLog.totalEmission
    };

    // Call the activity log service to submit the data
    this.activityLogService.submitActivityLog(activityData).subscribe(
      (response) => {
        console.log('Activity log submitted successfully:', response);
        alert('Activity log submitted successfully')
      },
      (error) => {
        console.error('Error submitting activity log:', error);
      }
    );
  }
  logout(): void {
    localStorage.removeItem('token');  // Remove token to log out
    localStorage.removeItem('user');   // Remove user data from localStorage
    this.router.navigate(['/logreg-page']);  // Navigate to the login page
  }
}
