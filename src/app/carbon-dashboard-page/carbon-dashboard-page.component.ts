import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { UserService } from '../services/user.service';
import { ActivityLogService } from '../services/activity-log.service';
import { EducationalContentService } from '../services/educational-content.service';
import { GoalService } from '../services/goal.service';
import { ChatService } from '../services/chat.service';
declare var Swiper: any;

Chart.register(...registerables);

@Component({
  selector: 'app-carbon-dashboard-page',
  templateUrl: './carbon-dashboard-page.component.html',
  styleUrls: ['./carbon-dashboard-page.component.css'],
})
export class CarbonDashboardPageComponent implements AfterViewInit {
  
  constructor(private router: Router, private ngZone: NgZone, private goalService: GoalService, private chatService: ChatService, private userService: UserService, private activityLogService: ActivityLogService, private educationalContentService: EducationalContentService ) { }

  userData: any = {};  // Store the fetched user data
  username: string | null = '';  // Store the username from the token
  activityLogs: any[] = [];
  goals: any[] = [];
  mostFrequentStats: any = {};
  maxEmissionsCategory: any; 
  maxEmissionsValue: any;
  mostFrequentInCategory: any;
  currentmaxEmissionsCategory: any; 
  currentmaxEmissionsValue: any;
  currentmostFrequentInCategory: any;
  educationalContentList: any = {};
  chatHistory: any[] = [];
  unreadMessageCount: any = 0
  allChatHistory: { username: string; messages: { sender: string, content: string; isRead: boolean; timestamp: Date }[] }[] = [];
  dateFilteredStats: any
  currentFilteredStats: any
  currentDate: string = ''; 
  fromDate: string = '';
  toDate: string = '';
  thecurrentDate: string = '';
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


  ngAfterViewInit(): void {
    
  }


  isLoggedIn: boolean = false;

  ngOnInit(): void {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    this.thecurrentDate = today.toISOString().split('T')[0];  
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
            spaceBetween: 20,
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
      }})
    });

    console.log('Component initialized.');
    
    if (!this.userService.isLoggedIn()) {
      console.error('User is not logged in. Redirecting to logreg-page.');
      this.router.navigate(['/logreg-page']);
      return; // Stop further initialization
    }
    // Get the username from the JWT token
    this.username = this.userService.getUsernameFromToken();
    console.log('Decoded username:', this.username);
    this.fetchActivityLogs()
    this.createChart();
    this.fetchAllEducationalContent()
    this.fetchAllGoals();
    
    // Fetch user data if the username exists
    if (this.username) {
      this.fetchUserData(this.username);
    } else {
      this.calculateMostFrequentStats()    
      console.error('Username not found in the token.');
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public chart1: any;
  public chart2: any;
  public chart3: any;

  createChart() {
    this.chart1 = new Chart('canvas1', {
      type: 'doughnut',
      data: {
        labels: ['Transportation', 'Energy Sources', 'Meals'],
        datasets: [{
          label: 'Kg',
          data: [300, 50, 100],
          backgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true, // Aktifkan responsivitas
        maintainAspectRatio: false, // Supaya chart bisa memenuhi ruang vertikal
        plugins: {
          legend: {
            display: true,
            position: 'top', // 'top', 'bottom', 'left', atau 'right'
          }
        },
      }
    });

    this.chart2 = new Chart('canvas2', {
      type: 'doughnut',
      data: {
        labels: ['Transportation', 'Energy', 'Diet'],
        datasets: [{
          label: 'Kg',
          data: [300, 50, 100],
          backgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true, // Aktifkan responsivitas
        maintainAspectRatio: false, // Supaya chart bisa memenuhi ruang vertikal
        plugins: {
          legend: {
            display: true,
            position: 'top', // 'top', 'bottom', 'left', atau 'right'
          }
        },
      }
    });
    this.chart3 = new Chart('canvas3', {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Transportation Emissions',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Energy Emissions',
            data: [],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Diet Emissions',
            data: [],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Emissions Data'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            stacked: true // Stack the bars for each label
          }
        }
      }
    });    
  }

  // Fetch user data by username
  fetchUserData(username: string): void {
    console.log('Fetching data for username:', username);
    this.userService.getUserByUsername(username).subscribe(
      data => {
        this.userData = data;  // Store the fetched user data
        console.log('User data fetched successfully:', this.userData);
        this.calculateMostFrequentStats();
        this.fetchAllChatHistory();
        this.calculateMostFrequentStatsForSelectedDate();
      },
      error => {
        console.error('Error fetching user data:', error);
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

  fetchActivityLogs(username: string | null = this.username): void {
    // Use a fallback value if username is null
    const validUsername = username || '';
    
    this.activityLogService.fetchActivityLogsByUsername(validUsername).subscribe(
      (response) => {
        this.activityLogs = response;
        console.log('Fetched activity logs:', this.activityLogs);
      },
      (error) => {
        alert('REMINDER: UPDATE DAILY ACTIVITY LOG')
        console.error('Error fetching activity logs:', error);
      }
    );
  }

  calculateMostFrequentStatsForSelectedDate(selectedDate: string = this.currentDate): void {
    const stats = {
      transportationModes: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      energyUsage: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      meals: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      totalEmission: 0,
    };
  
    // Convert selected date to Date object
    const selectedDateObj = new Date(selectedDate);
    const selectedDateString = selectedDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
    // Filter activity logs based on selected date
    const filteredLogs = this.activityLogs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.toISOString().split('T')[0] === selectedDateString;
    });
  
    // Loop through the filtered logs for the selected date
    filteredLogs.forEach((log) => {
      // Transportation Modes
      if (log.transportationModes) {
        stats.transportationModes.counts[log.transportationModes] =
          (stats.transportationModes.counts[log.transportationModes] || 0) + 1;
  
        stats.transportationModes.total += log.transportationEmission || 0;
      }
  
      // Energy Usage
      if (log.energyUsage) {
        stats.energyUsage.counts[log.energyUsage] =
          (stats.energyUsage.counts[log.energyUsage] || 0) + 1;
  
        stats.energyUsage.total += log.energyEmission || 0;
      }
  
      // Meals
      if (log.meals) {
        stats.meals.counts[log.meals] =
          (stats.meals.counts[log.meals] || 0) + 1;
  
        stats.meals.total += log.mealsEmission || 0;
      }
    });
  
    // Find the most frequent item for each category
    stats.transportationModes.mostFrequent = this.getMostFrequent(stats.transportationModes.counts);
    stats.energyUsage.mostFrequent = this.getMostFrequent(stats.energyUsage.counts);
    stats.meals.mostFrequent = this.getMostFrequent(stats.meals.counts);
  
    // Calculate the total emissions for the most frequent items
    stats.transportationModes.mostFrequentTotal = this.getMostFrequentTotal(
      filteredLogs,
      'transportationModes',
      stats.transportationModes.mostFrequent,
      'transportationEmission'
    );
  
    stats.energyUsage.mostFrequentTotal = this.getMostFrequentTotal(
      filteredLogs,
      'energyUsage',
      stats.energyUsage.mostFrequent,
      'energyEmission'
    );
  
    stats.meals.mostFrequentTotal = this.getMostFrequentTotal(
      filteredLogs,
      'meals',
      stats.meals.mostFrequent,
      'mealsEmission'
    );
  
    stats.totalEmission =
    stats.transportationModes.total +
    stats.energyUsage.total +
    stats.meals.total;
    
  
     // Find the most frequent item for each category
     stats.transportationModes.mostFrequent = this.getMostFrequent(stats.transportationModes.counts);
     stats.energyUsage.mostFrequent = this.getMostFrequent(stats.energyUsage.counts);
     stats.meals.mostFrequent = this.getMostFrequent(stats.meals.counts);
   
     // Calculate the total emissions for the most frequent items
     stats.transportationModes.mostFrequentTotal = this.getMostFrequentTotal(
       this.activityLogs,
       'transportationModes',
       stats.transportationModes.mostFrequent,
       'transportationEmission'
     );
   
     stats.energyUsage.mostFrequentTotal = this.getMostFrequentTotal(
       this.activityLogs,
       'energyUsage',
       stats.energyUsage.mostFrequent,
       'energyEmission'
     );
   
     stats.meals.mostFrequentTotal = this.getMostFrequentTotal(
       this.activityLogs,
       'meals',
       stats.meals.mostFrequent,
       'mealsEmission'
     );
   
     // Determine which category has the highest total emissions
     const emissionsByCategory = {
       transportation: stats.transportationModes.total,
       energy: stats.energyUsage.total,
       meals: stats.meals.total,
     };
   
     // Find the category with the highest emissions
     const maxEmissionsCategory = Object.keys(emissionsByCategory).reduce((a, b) =>
       emissionsByCategory[a as 'transportation' | 'energy' | 'meals'] >
       emissionsByCategory[b as 'transportation' | 'energy' | 'meals']
         ? a
         : b
     ) as 'transportation' | 'energy' | 'meals';
   
     const maxEmissionsValue = emissionsByCategory[maxEmissionsCategory];
   
     // Determine the most frequent item with the highest emissions in each category
     const mostFrequentInCategory = {
       transportation: this.getMostFrequentItemWithEmission(
         this.activityLogs,
         'transportationModes',
         stats.transportationModes.mostFrequent,
         'transportationEmission'
       ),
       energy: this.getMostFrequentItemWithEmission(
         this.activityLogs,
         'energyUsage',
         stats.energyUsage.mostFrequent,
         'energyEmission'
       ),
       meals: this.getMostFrequentItemWithEmission(
         this.activityLogs,
         'meals',
         stats.meals.mostFrequent,
         'mealsEmission'
       ),
     };
   
     // Add the results to the stats object
     this.currentFilteredStats = stats;
     this.currentmaxEmissionsCategory = maxEmissionsCategory;
     this.currentmaxEmissionsValue = maxEmissionsValue;
     this.currentmostFrequentInCategory = mostFrequentInCategory;
   
     // Output the most frequent stats and the category with the highest emissions
     console.log('Most Frequent Stats:', this.mostFrequentStats);
     console.log('Current Emission:', this.currentFilteredStats.totalEmission);
     console.log('Category with Highest Emissions:', this.currentmaxEmissionsValue);
     console.log('Highest Emissions Value:', this.maxEmissionsValue);
     console.log('Most Frequent Items with Emissions:', this.mostFrequentInCategory);
     this.updateChartthis(stats);
  }
  
  updateChartthis(stats: any): void {
    // Extract the data for the chart (this is just an example based on stats)
    const labels = [
      stats.transportationModes.mostFrequent,
      stats.energyUsage.mostFrequent,
      stats.meals.mostFrequent,
    ];
    const data = [
      stats.transportationModes.total,
      stats.energyUsage.total,
      stats.meals.total,
    ];
  
    // Update the chart with new data
    if (this.chart1) {
      this.chart1.data.labels = labels;
      this.chart1.data.datasets[0].data = data;
      this.chart1.update();
    }
  }
  

  calculateMostFrequentStats(): void {
    const stats = {
      transportationModes: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      energyUsage: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      meals: {
        counts: {} as Record<string, number>,
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
    };
  
    // Loop through all activity logs
    this.activityLogs.forEach((log) => {
      // Transportation Modes
      if (log.transportationModes) {
        // Count occurrences of each mode
        stats.transportationModes.counts[log.transportationModes] =
          (stats.transportationModes.counts[log.transportationModes] || 0) + 1;
  
        // Add the emission value
        stats.transportationModes.total += log.transportationEmission || 0;
      }
  
      // Energy Usage
      if (log.energyUsage) {
        // Count occurrences of each type of energy usage
        stats.energyUsage.counts[log.energyUsage] =
          (stats.energyUsage.counts[log.energyUsage] || 0) + 1;
  
        // Add the emission value
        stats.energyUsage.total += log.energyEmission || 0;
      }
  
      // Meals
      if (log.meals) {
        // Count occurrences of each meal type
        stats.meals.counts[log.meals] =
          (stats.meals.counts[log.meals] || 0) + 1;
  
        // Add the emission value
        stats.meals.total += log.mealsEmission || 0;
      }
    });
  
    // Find the most frequent item for each category
    stats.transportationModes.mostFrequent = this.getMostFrequent(stats.transportationModes.counts);
    stats.energyUsage.mostFrequent = this.getMostFrequent(stats.energyUsage.counts);
    stats.meals.mostFrequent = this.getMostFrequent(stats.meals.counts);
  
    // Calculate the total emissions for the most frequent items
    stats.transportationModes.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'transportationModes',
      stats.transportationModes.mostFrequent,
      'transportationEmission'
    );
  
    stats.energyUsage.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'energyUsage',
      stats.energyUsage.mostFrequent,
      'energyEmission'
    );
  
    stats.meals.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'meals',
      stats.meals.mostFrequent,
      'mealsEmission'
    );
  
    // Determine which category has the highest total emissions
    const emissionsByCategory = {
      Transportation: stats.transportationModes.total,
      'Energy Sources': stats.energyUsage.total,
      Dietary: stats.meals.total,
    };
  
    // Find the category with the highest emissions
    const maxEmissionsCategory = Object.keys(emissionsByCategory).reduce((a, b) =>
      emissionsByCategory[a as 'Transportation' | 'Energy Sources' | 'Dietary'] >
      emissionsByCategory[b as 'Transportation' | 'Energy Sources' | 'Dietary']
        ? a
        : b
    ) as 'Transportation' | 'Energy Sources' | 'Dietary';
  
    const maxEmissionsValue = emissionsByCategory[maxEmissionsCategory];
  
    // Determine the most frequent item with the highest emissions in each category
    const mostFrequentInCategory = {
      transportation: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'transportationModes',
        stats.transportationModes.mostFrequent,
        'transportationEmission'
      ),
      energy: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'energyUsage',
        stats.energyUsage.mostFrequent,
        'energyEmission'
      ),
      meals: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'meals',
        stats.meals.mostFrequent,
        'mealsEmission'
      ),
    };
  
    // Add the results to the stats object
    this.mostFrequentStats = stats;
    this.maxEmissionsCategory = maxEmissionsCategory;
    this.maxEmissionsValue = maxEmissionsValue;
    this.mostFrequentInCategory = mostFrequentInCategory;
  
    // Output the most frequent stats and the category with the highest emissions
    console.log('Most Frequent Stats:', this.mostFrequentStats);
    console.log('Category with Highest Emissions:', this.maxEmissionsCategory);
    console.log('Highest Emissions Value:', this.maxEmissionsValue);
    console.log('Most Frequent Items with Emissions:', this.mostFrequentInCategory);
  }

  applyDateRange(): void {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both From Date and To Date.');
      return;
    }

    const fromDate = new Date(this.fromDate);
    const toDate = new Date(this.toDate);

    if (fromDate > toDate) {
      alert('From Date cannot be later than To Date.');
      return;
    }

    this.filterDataAndUpdateCharts(fromDate, toDate);
  }
  
  filterDataAndUpdateCharts(fromDate: Date, toDate: Date): void {
    // Example filtering logic based on date range
    const filteredLogs = this.activityLogs.filter((log) => {
      const logDate = new Date(log.date); // Assuming log has a 'date' property
      return logDate >= fromDate && logDate <= toDate;
    });
  
    // Update your charts with filtered data
    this.calculateStatsForDateRange(filteredLogs);
  }
  

  calculateStatsForDateRange(filteredLogs: any[]): void {
    const stats = {
      transportationModes: {
        counts: {} as Record<string, number>,
        daily: {} as Record<string, number>,  // Add daily breakdown
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      energyUsage: {
        counts: {} as Record<string, number>,
        daily: {} as Record<string, number>,  // Add daily breakdown
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
      meals: {
        counts: {} as Record<string, number>,
        daily: {} as Record<string, number>,  // Add daily breakdown
        mostFrequent: '',
        total: 0,
        mostFrequentTotal: 0,
      },
    };
  
    // Loop through filtered logs and calculate stats
    filteredLogs.forEach((log) => {
      const logDate = new Date(log.date).toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  
      // Transportation Modes
      if (log.transportationModes) {
        stats.transportationModes.counts[log.transportationModes] =
          (stats.transportationModes.counts[log.transportationModes] || 0) + 1;
  
        stats.transportationModes.daily[logDate] =
          (stats.transportationModes.daily[logDate] || 0) + (log.transportationEmission || 0);
        
        stats.transportationModes.total += log.transportationEmission || 0;
      }
  
      // Energy Usage
      if (log.energyUsage) {
        stats.energyUsage.counts[log.energyUsage] =
          (stats.energyUsage.counts[log.energyUsage] || 0) + 1;
  
        stats.energyUsage.daily[logDate] =
          (stats.energyUsage.daily[logDate] || 0) + (log.energyEmission || 0);
  
        stats.energyUsage.total += log.energyEmission || 0;
      }
  
      // Meals
      if (log.meals) {
        stats.meals.counts[log.meals] =
          (stats.meals.counts[log.meals] || 0) + 1;
  
        stats.meals.daily[logDate] =
          (stats.meals.daily[logDate] || 0) + (log.mealsEmission || 0);
  
        stats.meals.total += log.mealsEmission || 0;
      }
    });
  
    // Most Frequent Item Calculation
    stats.transportationModes.mostFrequent = this.getMostFrequent(stats.transportationModes.counts);
    stats.energyUsage.mostFrequent = this.getMostFrequent(stats.energyUsage.counts);
    stats.meals.mostFrequent = this.getMostFrequent(stats.meals.counts);

    // Calculate the total emissions for the most frequent items
    stats.transportationModes.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'transportationModes',
      stats.transportationModes.mostFrequent,
      'transportationEmission'
    );
  
    stats.energyUsage.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'energyUsage',
      stats.energyUsage.mostFrequent,
      'energyEmission'
    );
  
    stats.meals.mostFrequentTotal = this.getMostFrequentTotal(
      this.activityLogs,
      'meals',
      stats.meals.mostFrequent,
      'mealsEmission'
    );
  
    // Determine which category has the highest total emissions
    const emissionsByCategory = {
      transportation: stats.transportationModes.total,
      energy: stats.energyUsage.total,
      meals: stats.meals.total,
    };
  
    // Find the category with the highest emissions
    const maxEmissionsCategory = Object.keys(emissionsByCategory).reduce((a, b) =>
      emissionsByCategory[a as 'transportation' | 'energy' | 'meals'] >
      emissionsByCategory[b as 'transportation' | 'energy' | 'meals']
        ? a
        : b
    ) as 'transportation' | 'energy' | 'meals';
  
    const maxEmissionsValue = emissionsByCategory[maxEmissionsCategory];
  
    // Determine the most frequent item with the highest emissions in each category
    const mostFrequentInCategory = {
      transportation: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'transportationModes',
        stats.transportationModes.mostFrequent,
        'transportationEmission'
      ),
      energy: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'energyUsage',
        stats.energyUsage.mostFrequent,
        'energyEmission'
      ),
      meals: this.getMostFrequentItemWithEmission(
        this.activityLogs,
        'meals',
        stats.meals.mostFrequent,
        'mealsEmission'
      ),
    };
  
   
  
    console.log('Stats for Selected Date Range:', stats);
  
    // Store the filtered stats in a separate variable
    this.dateFilteredStats = stats;
  
    // Optionally, you can update the chart or UI here with the new stats
    this.updateChart(stats);
  }
     
  
  updateChart(stats: any, fromDate = this.fromDate, toDate = this.toDate): void {
    // Generate date labels between 'fromDate' and 'toDate'
    const dateLabels = this.generateDateRange(fromDate, toDate);
  
    // Update Chart 2 (Doughnut Chart) - Example for summarized data
    this.chart2.data.labels = ['Transportation', 'Energy', 'Diet'];
    this.chart2.data.datasets[0].data = [
      stats.transportationModes.total,
      stats.energyUsage.total,
      stats.meals.total,
    ];
    this.chart2.update();
  
    // Update Chart 3 (Bar Chart) - Use the generated date range as labels
    this.chart3.data.labels = dateLabels;
  
    // Update datasets with the stats data (assuming you have daily breakdown for emissions)
    this.chart3.data.datasets[0].label = 'Transportation Emissions';
    this.chart3.data.datasets[0].data = dateLabels.map((date: string | number) => stats.transportationModes.daily[date] || 0);
  
    this.chart3.data.datasets[1].label = 'Energy Emissions';
    this.chart3.data.datasets[1].data = dateLabels.map((date: string | number) => stats.energyUsage.daily[date] || 0);
  
    this.chart3.data.datasets[2].label = 'Diet Emissions';
    this.chart3.data.datasets[2].data = dateLabels.map((date: string | number) => stats.meals.daily[date] || 0);
  
    this.chart3.update();
  }

  generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const activityDates = new Set<string>();
  
    // Collect all the unique dates from activity logs
    this.activityLogs.forEach(log => {
      const logDate = new Date(log.date);
      const logDateString = logDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      if (logDate >= start && logDate <= end) {
        activityDates.add(logDateString);
      }
    });
  
    // Generate dates from startDate to endDate, adding both activity and missing dates
    while (start <= end) {
      const formattedDate = start.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      dates.push(activityDates.has(formattedDate) ? formattedDate : formattedDate);
      start.setDate(start.getDate() + 1); // Increment by one day
    }
  
    return dates;
  }
  
    
  // Get the most frequent item from a given count record
  getMostFrequent(counts: Record<string, number>): string {
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), '');
  }
    
  // Get the most frequent item and its total emissions in each category
  getMostFrequentItemWithEmission(
    logs: any[],
    category: 'transportationModes' | 'energyUsage' | 'meals',
    mostFrequent: string,
    emissionKey: 'transportationEmission' | 'energyEmission' | 'mealsEmission'
  ): string {
    const itemEmissions = logs
      .filter((log) => log[category] === mostFrequent)
      .map((log) => log[emissionKey] || 0);
  
    const totalEmission = itemEmissions.reduce((total, emission) => total + emission, 0);
  
    return `${mostFrequent} with ${totalEmission}`;
  } 
    
  // Get the total emissions for the most frequent item in each category
  getMostFrequentTotal(
    logs: any[],
    category: 'transportationModes' | 'energyUsage' | 'meals',
    mostFrequent: string,
    emissionKey: 'transportationEmission' | 'energyEmission' | 'mealsEmission'
  ): number {
    return logs
      .filter((log) => log[category] === mostFrequent)
      .reduce((total, log) => total + (log[emissionKey] || 0), 0);
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

  getUnreadMessages(friendUsername: string): number {
    const chatHistory = this.allChatHistory.find(chat => chat.username === friendUsername);

    if (chatHistory) {
      // Filter messages where isRead is false and sender is not the current user
      return chatHistory.messages.filter(message => !message.isRead && message.sender !== this.userData.username).length;
    }

    return 0;
  }

     
  logout(): void {
    localStorage.removeItem('token');  // Remove token to log out
    localStorage.removeItem('user');   // Remove user data from localStorage
    this.router.navigate(['/logreg-page']);  // Navigate to the login page
  }
  
  goToLogin(): void {
    this.router.navigate(['/logreg-page']);  // Navigate to login page
  }
}
