import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { EducationalContentDetailPageComponent } from '../educational-content-detail-page/educational-content-detail-page.component';
import { EducationalContentService } from '../services/educational-content.service';


@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  educationalContent: any = {
    title: '',
    description: '',
    category: '',
    url: '',
    tags: [],  // Initialize tags as an empty array for multi-select
    pictures: ''
  };
  selectedImages: File[] = [];
  selectedImagesBase64: string[] = [];
  imagePreview: string | null = '';
  successMessage: string = '';
  errorMessage: string = '';
  educationalContentList: any[] = [];
  selectedEducationalContent: any;
  selectedContent: any = {
    title: '',
    description: '',
    category: '',
    url: '',
    tags: [],  // Initialize tags as an empty array for multi-select
    pictures: ''
  };
  idContent: any;
  picChange: boolean = false


  constructor(private userService: UserService, private router: Router, private educationalContentService: EducationalContentService) {}

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      // If not logged in, navigate to login or home page
      this.router.navigate(['/logreg-page']);  // Replace with your desired route
    } else if (!this.userService.isAdmin()) {
      // If not an admin, navigate to home
      this.router.navigate(['/']);
    }
    this.fetchAllEducationalContent()    
  }

  // Handle image error event
  handleImageError(event: any, product: any): void {
    console.error('Image loading error for product:', product, event);
    product.errorImage = true;
  }

  // Handle image error event for profile picture
  getErrorImageUrl(): string {
    return '';
  }

  // Get image URL from image data (Base64 or Blob)
  getImageUrl(imageData: any): string {
    if (imageData && imageData.data) {
      const blob = new Blob([new Uint8Array(imageData.data)], { type: imageData.contentType });
      return URL.createObjectURL(blob);
    }
    return this.getErrorImageUrl();
  }

  openEditModal(content: any) {
    this.selectedContent = content;
    console.log('Selected content:', this.selectedContent);    
    this.educationalContentService.fetchSpecificEducationalContent(content._id).subscribe(
      (response: any) => {
        this.idContent = response._id
        this.selectedContent = response;
        console.log('Fetched specific educational content:', this.selectedContent);
        console.log('id:', this.idContent);
      },
      (error: any) => {
        console.error('Error fetching specific educational content:', error);
      }
    );
  }

  openDeleteModal(content: any) {
    this.selectedContent = content;
    console.log('Selected content:', this.selectedContent);    
    this.educationalContentService.fetchSpecificEducationalContent(content._id).subscribe(
      (response: any) => {
        this.idContent = response._id
        this.selectedContent = response;
        console.log('Fetched specific educational content:', this.selectedContent);
        console.log('id:', this.idContent);
      },
      (error: any) => {
        console.error('Error fetching specific educational content:', error);
      }
    );
  }
  

  onFileChange(event: any): void {
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
        this.picChange = true
      }
    } else {
      // Clear selections if no file is selected
      this.imagePreview = null;
      this.selectedImages = [];
      this.selectedImagesBase64 = [];
    }
  }  

  submitEducationalContent() {
    if (this.selectedImages.length === 0) {
      console.error('Please select at least one image.');
      this.errorMessage = 'Please select at least one image.';
      return;
    }
  
    // Prepare FormData for submission
    const formData = new FormData();
  
    // Append each selected image to the FormData
    for (let i = 0; i < this.selectedImages.length; i++) {
      formData.append('pictures', this.selectedImages[i]);
    }
  
    // Append the other educational content fields
    formData.append('title', this.educationalContent.title);
    formData.append('description', this.educationalContent.description);
    formData.append('category', this.educationalContent.category);
    formData.append('url', this.educationalContent.url);
    formData.append('tags', this.educationalContent.tags); // Convert tags array to JSON string
  
    // Make the HTTP request using the service
    this.educationalContentService.submitEducationalContent(formData).subscribe(
      (response: any) => {
        console.log('Educational content added successfully:', response);
        alert('Educational content added successfully!')
        this.successMessage = 'Educational content added successfully!';
        this.resetForm(); // Reset the form after successful submission
        window.location.reload();
      },
      (error: any) => {
        console.error('Error adding educational content:', error);
        this.errorMessage = 'Error adding educational content. Please try again.';
      }
    );
  }

  editEducationalContent() {
    if (!this.idContent) {
      console.error('No educational content ID provided for editing.');
      this.errorMessage = 'No educational content ID provided.';
      return;
    }
    
    // Prepare FormData for submission
    const formData = new FormData();
  
    // If picChange is true and there are selected images, append them to formData
    if (this.picChange && this.selectedImages.length > 0) {
      for (let i = 0; i < this.selectedImages.length; i++) {
        formData.append('pictures', this.selectedImages[i]);
      }
    }
  
    // If picChange is false, make sure not to append any pictures
    formData.append('id', this.idContent); // Include the ID for updating
    formData.append('title', this.selectedContent.title);
    formData.append('description', this.selectedContent.description);
    formData.append('category', this.selectedContent.category);
    formData.append('url', this.selectedContent.url);
    formData.append('tags', this.selectedContent.tags); // Convert tags array to JSON string
    formData.append('picChange', String(this.picChange)); // Add picChange flag to formData
  
    // Make the HTTP request using the service
    this.educationalContentService.updateEducationalContent(this.idContent, formData).subscribe(
      (response: any) => {
        console.log('Educational content updated successfully:', response);
        alert('Educational content updated successfully!')
        this.successMessage = 'Educational content updated successfully!';
        this.resetForm();
        this.fetchAllEducationalContent(); // Refresh the content list
        window.location.reload();
      },
      (error: any) => {
        console.error('Error updating educational content:', error);
        this.errorMessage = 'Error updating educational content. Please try again.';
      }
    );
  }
  
  
  addParagraph(): void {
    this.educationalContent.paragraphs.push('');
  }
  
  removeParagraph(index: number): void {
    this.educationalContent.paragraphs.splice(index, 1);
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

  // Fetch specific educational content by ID
  fetchSpecificEducationalContent(contentId: string): void {
    this.educationalContentService.fetchSpecificEducationalContent(contentId).subscribe(
      (response) => {
        this.selectedEducationalContent = response;
        console.log('Fetched specific educational content:', this.selectedEducationalContent);
      },
      (error) => {
        console.error('Error fetching specific educational content:', error);
      }
    );
  }

  deleteEducationalContent(contentId = this.idContent): void {
    // Call the service to delete the content
    this.educationalContentService.deleteEducationalContent(contentId).subscribe(
      (response: any) => {
        console.log('Educational content deleted successfully:', response);
        alert('Educational content deleted successfully!')
        this.successMessage = 'Educational content deleted successfully!';
        this.fetchAllEducationalContent();  // Refresh the content list after deletion
        window.location.reload();
      },
      (error: any) => {
        console.error('Error deleting educational content:', error);
        this.errorMessage = 'Error deleting educational content. Please try again.';
      }
    );
  }
  
  
  resetForm() {
    this.educationalContent = {
      title: '',
      description: '',
      category: '',
      url: '',
      tags: [],
      pictures: ''
    };
  }
  
  logout(): void {
    localStorage.removeItem('token');  // Remove token to log out
    localStorage.removeItem('user');   // Remove user data from localStorage
    this.router.navigate(['/logreg-page']);  // Navigate to the login page
  }
}
