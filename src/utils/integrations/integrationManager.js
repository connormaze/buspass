import { db } from '../../config/firebase';
import { doc, updateDoc, getDoc, setDoc, collection } from 'firebase/firestore';

// Utility function for browser-compatible crypto operations
const generateHmac = async (message, key) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Integration Types
export const INTEGRATION_TYPES = {
  SIS: 'STUDENT_INFORMATION_SYSTEM',
  LMS: 'LEARNING_MANAGEMENT_SYSTEM',
  COMMUNICATION: 'COMMUNICATION_PLATFORM',
  VIRTUAL_MEETING: 'VIRTUAL_MEETING_PLATFORM',
  COLLABORATION: 'COLLABORATION_PLATFORM'
};

// Supported Platforms
export const SUPPORTED_PLATFORMS = {
  POWERSCHOOL: {
    name: 'PowerSchool',
    type: INTEGRATION_TYPES.SIS,
    apiVersion: 'v2',
    endpoints: {
      students: '/ws/v1/district/student',
      schools: '/ws/v1/district/school',
      courses: '/ws/v1/district/course'
    }
  },
  CLEVER: {
    name: 'Clever',
    type: INTEGRATION_TYPES.SIS,
    apiVersion: 'v3.0',
    endpoints: {
      students: '/v3.0/students',
      teachers: '/v3.0/teachers',
      sections: '/v3.0/sections'
    }
  },
  GOOGLE_CLASSROOM: {
    name: 'Google Classroom',
    type: INTEGRATION_TYPES.LMS,
    apiVersion: 'v1',
    endpoints: {
      courses: '/v1/courses',
      students: '/v1/courses/{courseId}/students',
      teachers: '/v1/courses/{courseId}/teachers'
    }
  },
  CANVAS: {
    name: 'Canvas LMS',
    type: INTEGRATION_TYPES.LMS,
    apiVersion: 'v1',
    endpoints: {
      courses: '/api/v1/courses',
      users: '/api/v1/users',
      assignments: '/api/v1/courses/{courseId}/assignments'
    }
  },
  BLACKBOARD: {
    name: 'Blackboard',
    type: INTEGRATION_TYPES.LMS,
    apiVersion: 'v3',
    endpoints: {
      courses: '/learn/api/public/v3/courses',
      users: '/learn/api/public/v3/users',
      contents: '/learn/api/public/v3/courses/{courseId}/contents'
    }
  },
  MICROSOFT_TEAMS: {
    name: 'Microsoft Teams',
    type: INTEGRATION_TYPES.VIRTUAL_MEETING,
    apiVersion: 'v1.0',
    endpoints: {
      teams: '/v1.0/teams',
      channels: '/v1.0/teams/{teamId}/channels',
      members: '/v1.0/teams/{teamId}/members'
    }
  },
  ZOOM: {
    name: 'Zoom',
    type: INTEGRATION_TYPES.VIRTUAL_MEETING,
    apiVersion: 'v2',
    endpoints: {
      users: '/v2/users',
      meetings: '/v2/users/{userId}/meetings',
      recordings: '/v2/users/{userId}/recordings'
    }
  },
  SLACK: {
    name: 'Slack',
    type: INTEGRATION_TYPES.COLLABORATION,
    apiVersion: 'v2',
    endpoints: {
      channels: '/api/conversations.list',
      messages: '/api/chat.postMessage',
      users: '/api/users.list'
    }
  },
  PARENTSQUARE: {
    name: 'ParentSquare',
    type: INTEGRATION_TYPES.COMMUNICATION,
    apiVersion: 'v1',
    endpoints: {
      posts: '/api/v1/posts',
      groups: '/api/v1/groups',
      users: '/api/v1/users'
    }
  }
};

class IntegrationManager {
  constructor() {
    this.integrations = new Map();
  }

  async setupIntegration(schoolId, platform, credentials) {
    try {
      const integrationRef = doc(db, 'schools', schoolId, 'integrations', platform);
      
      // Validate credentials based on platform
      this.validateCredentials(platform, credentials);
      
      // Store encrypted credentials
      await setDoc(integrationRef, {
        platform,
        credentials: this.encryptCredentials(credentials),
        status: 'active',
        lastSync: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Error setting up ${platform} integration:`, error);
      throw error;
    }
  }

  validateCredentials(platform, credentials) {
    switch (platform) {
      case 'POWERSCHOOL':
        if (!credentials.clientId || !credentials.clientSecret || !credentials.apiUrl) {
          throw new Error('PowerSchool requires clientId, clientSecret, and apiUrl');
        }
        break;
      case 'GOOGLE_CLASSROOM':
        if (!credentials.apiKey || !credentials.clientId || !credentials.clientSecret) {
          throw new Error('Google Classroom requires apiKey, clientId, and clientSecret');
        }
        break;
      case 'CANVAS':
        if (!credentials.accessToken || !credentials.domain) {
          throw new Error('Canvas requires accessToken and domain');
        }
        break;
      case 'BLACKBOARD':
        if (!credentials.applicationKey || !credentials.secret || !credentials.domain) {
          throw new Error('Blackboard requires applicationKey, secret, and domain');
        }
        break;
      case 'MICROSOFT_TEAMS':
        if (!credentials.clientId || !credentials.clientSecret || !credentials.tenantId) {
          throw new Error('Microsoft Teams requires clientId, clientSecret, and tenantId');
        }
        break;
      case 'ZOOM':
        if (!credentials.apiKey || !credentials.apiSecret) {
          throw new Error('Zoom requires apiKey and apiSecret');
        }
        break;
      case 'SLACK':
        if (!credentials.botToken || !credentials.signingSecret) {
          throw new Error('Slack requires botToken and signingSecret');
        }
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async syncData(schoolId, platform) {
    try {
      const integrationRef = doc(db, 'schools', schoolId, 'integrations', platform);
      const integrationDoc = await getDoc(integrationRef);

      if (!integrationDoc.exists()) {
        throw new Error(`No integration found for ${platform}`);
      }

      const integration = integrationDoc.data();
      const credentials = this.decryptCredentials(integration.credentials);

      // Perform platform-specific sync
      let syncResult;
      switch (platform) {
        case 'POWERSCHOOL':
          syncResult = await this.syncPowerSchool(schoolId, credentials);
          break;
        case 'CLEVER':
          syncResult = await this.syncClever(schoolId, credentials);
          break;
        case 'GOOGLE_CLASSROOM':
          syncResult = await this.syncGoogleClassroom(schoolId, credentials);
          break;
        case 'CANVAS':
          syncResult = await this.syncCanvas(schoolId, credentials);
          break;
        case 'BLACKBOARD':
          syncResult = await this.syncBlackboard(schoolId, credentials);
          break;
        case 'MICROSOFT_TEAMS':
          syncResult = await this.syncMicrosoftTeams(schoolId, credentials);
          break;
        case 'ZOOM':
          syncResult = await this.syncZoom(schoolId, credentials);
          break;
        case 'SLACK':
          syncResult = await this.syncSlack(schoolId, credentials);
          break;
        case 'PARENTSQUARE':
          syncResult = await this.syncParentSquare(schoolId, credentials);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Update last sync timestamp and sync results
      await updateDoc(integrationRef, {
        lastSync: new Date(),
        lastSyncResult: syncResult,
        updatedAt: new Date()
      });

      return syncResult;
    } catch (error) {
      console.error(`Error syncing data for ${platform}:`, error);
      // Update integration status with error
      await updateDoc(doc(db, 'schools', schoolId, 'integrations', platform), {
        lastSyncError: error.message,
        status: 'error',
        updatedAt: new Date()
      });
      throw error;
    }
  }

  // Platform-specific sync implementations
  async syncPowerSchool(schoolId, credentials) {
    try {
      const { clientId, clientSecret, apiUrl } = credentials;
      
      // Create PowerSchool API client
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await fetch(`${apiUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) throw new Error('Failed to authenticate with PowerSchool');
      
      const { access_token } = await response.json();
      
      // Fetch and sync data
      const endpoints = SUPPORTED_PLATFORMS.POWERSCHOOL.endpoints;
      const syncedData = await Promise.all([
        this.fetchPowerSchoolData(`${apiUrl}${endpoints.students}`, access_token),
        this.fetchPowerSchoolData(`${apiUrl}${endpoints.schools}`, access_token),
        this.fetchPowerSchoolData(`${apiUrl}${endpoints.courses}`, access_token)
      ]);

      // Store synced data in Firestore
      await this.storeSyncedData(schoolId, 'POWERSCHOOL', syncedData);

      return { status: 'success', message: 'PowerSchool sync completed', data: syncedData };
    } catch (error) {
      console.error('PowerSchool sync error:', error);
      throw error;
    }
  }

  async syncClever(schoolId, credentials) {
    try {
      const { districtId, apiToken } = credentials;
      const baseUrl = 'https://api.clever.com';
      const headers = {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json'
      };

      // Fetch data from all endpoints
      const endpoints = SUPPORTED_PLATFORMS.CLEVER.endpoints;
      const [students, teachers, sections] = await Promise.all([
        this.fetchCleverData(`${baseUrl}${endpoints.students}`, headers),
        this.fetchCleverData(`${baseUrl}${endpoints.teachers}`, headers),
        this.fetchCleverData(`${baseUrl}${endpoints.sections}`, headers)
      ]);

      const syncedData = {
        students,
        teachers,
        sections,
        districtId
      };

      await this.storeSyncedData(schoolId, 'CLEVER', syncedData);
      return { status: 'success', message: 'Clever sync completed', data: syncedData };
    } catch (error) {
      console.error('Clever sync error:', error);
      throw error;
    }
  }

  async syncGoogleClassroom(schoolId, credentials) {
    try {
      const { apiKey, clientId, clientSecret } = credentials;
      
      // Use fetch to call Google Classroom API directly
      const baseUrl = 'https://classroom.googleapis.com/v1';
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      };

      // Fetch courses
      const coursesResponse = await fetch(`${baseUrl}/courses?courseStates=ACTIVE`, {
        headers
      });
      if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
      const courses = await coursesResponse.json();

      // Fetch students and teachers for each course
      const courseData = await Promise.all(courses.courses.map(async course => {
        const [studentsRes, teachersRes] = await Promise.all([
          fetch(`${baseUrl}/courses/${course.id}/students`, { headers }),
          fetch(`${baseUrl}/courses/${course.id}/teachers`, { headers })
        ]);

        const [students, teachers] = await Promise.all([
          studentsRes.ok ? studentsRes.json() : { students: [] },
          teachersRes.ok ? teachersRes.json() : { teachers: [] }
        ]);

        return {
          ...course,
          students: students.students || [],
          teachers: teachers.teachers || []
        };
      }));

      // Store synced data
      await this.storeSyncedData(schoolId, 'GOOGLE_CLASSROOM', courseData);

      return { status: 'success', message: 'Google Classroom sync completed', data: courseData };
    } catch (error) {
      console.error('Google Classroom sync error:', error);
      throw error;
    }
  }

  async syncCanvas(schoolId, credentials) {
    try {
      const { accessToken, domain } = credentials;
      const baseUrl = `https://${domain}`;
      
      // Fetch courses, users, and assignments
      const [courses, users] = await Promise.all([
        this.fetchCanvasData(`${baseUrl}/api/v1/courses`, accessToken),
        this.fetchCanvasData(`${baseUrl}/api/v1/users`, accessToken)
      ]);

      // Fetch assignments for each course
      const courseAssignments = await Promise.all(
        courses.map(course => 
          this.fetchCanvasData(`${baseUrl}/api/v1/courses/${course.id}/assignments`, accessToken)
        )
      );

      const syncedData = {
        courses,
        users,
        assignments: courseAssignments.flat()
      };

      await this.storeSyncedData(schoolId, 'CANVAS', syncedData);
      return { status: 'success', message: 'Canvas sync completed', data: syncedData };
    } catch (error) {
      console.error('Canvas sync error:', error);
      throw error;
    }
  }

  async syncBlackboard(schoolId, credentials) {
    try {
      const { applicationKey, secret, domain } = credentials;
      const baseUrl = `https://${domain}`;
      
      // Get OAuth token
      const authResponse = await fetch(`${baseUrl}/learn/api/public/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${applicationKey}&client_secret=${secret}`
      });

      if (!authResponse.ok) throw new Error('Failed to authenticate with Blackboard');
      const { access_token } = await authResponse.json();

      // Fetch data from endpoints
      const endpoints = SUPPORTED_PLATFORMS.BLACKBOARD.endpoints;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      };

      const [courses, users] = await Promise.all([
        this.fetchBlackboardData(`${baseUrl}${endpoints.courses}`, headers),
        this.fetchBlackboardData(`${baseUrl}${endpoints.users}`, headers)
      ]);

      // Fetch course contents
      const courseContents = await Promise.all(
        courses.results.map(course =>
          this.fetchBlackboardData(`${baseUrl}${endpoints.contents.replace('{courseId}', course.id)}`, headers)
        )
      );

      const syncedData = {
        courses: courses.results,
        users: users.results,
        courseContents
      };

      await this.storeSyncedData(schoolId, 'BLACKBOARD', syncedData);
      return { status: 'success', message: 'Blackboard sync completed', data: syncedData };
    } catch (error) {
      console.error('Blackboard sync error:', error);
      throw error;
    }
  }

  async syncMicrosoftTeams(schoolId, credentials) {
    try {
      const { clientId, clientSecret, tenantId } = credentials;
      const baseUrl = 'https://graph.microsoft.com/v1.0';
      
      // Get OAuth token
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=${clientId}&scope=https://graph.microsoft.com/.default&client_secret=${clientSecret}&grant_type=client_credentials`
      });

      if (!tokenResponse.ok) throw new Error('Failed to authenticate with Microsoft Teams');
      const { access_token } = await tokenResponse.json();

      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      };

      // Fetch teams
      const teamsResponse = await fetch(`${baseUrl}/teams`, { headers });
      if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
      const teams = await teamsResponse.json();

      // Fetch channels and members for each team
      const teamsData = await Promise.all(teams.value.map(async team => {
        const [channels, members] = await Promise.all([
          fetch(`${baseUrl}/teams/${team.id}/channels`, { headers }).then(res => res.json()),
          fetch(`${baseUrl}/teams/${team.id}/members`, { headers }).then(res => res.json())
        ]);

        return {
          ...team,
          channels: channels.value,
          members: members.value
        };
      }));

      const syncedData = { teams: teamsData };
      await this.storeSyncedData(schoolId, 'MICROSOFT_TEAMS', syncedData);
      return { status: 'success', message: 'Microsoft Teams sync completed', data: syncedData };
    } catch (error) {
      console.error('Microsoft Teams sync error:', error);
      throw error;
    }
  }

  async syncZoom(schoolId, credentials) {
    try {
      const { apiKey, apiSecret } = credentials;
      const baseUrl = 'https://api.zoom.us/v2';
      
      // Generate JWT token
      const payload = {
        iss: apiKey,
        exp: ((new Date()).getTime() + 5000)
      };
      const token = this.generateJWT(payload, apiSecret);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch users
      const usersResponse = await fetch(`${baseUrl}/users`, { headers });
      if (!usersResponse.ok) throw new Error('Failed to fetch Zoom users');
      const users = await usersResponse.json();

      // Fetch meetings and recordings for each user
      const userData = await Promise.all(users.users.map(async user => {
        const [meetings, recordings] = await Promise.all([
          fetch(`${baseUrl}/users/${user.id}/meetings`, { headers }).then(res => res.json()),
          fetch(`${baseUrl}/users/${user.id}/recordings`, { headers }).then(res => res.json())
        ]);

        return {
          ...user,
          meetings: meetings.meetings,
          recordings: recordings.meetings
        };
      }));

      const syncedData = { users: userData };
      await this.storeSyncedData(schoolId, 'ZOOM', syncedData);
      return { status: 'success', message: 'Zoom sync completed', data: syncedData };
    } catch (error) {
      console.error('Zoom sync error:', error);
      throw error;
    }
  }

  async syncSlack(schoolId, credentials) {
    try {
      const { botToken, signingSecret } = credentials;
      const baseUrl = 'https://slack.com/api';
      const headers = {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      };

      // Fetch data from all endpoints
      const endpoints = SUPPORTED_PLATFORMS.SLACK.endpoints;
      const [channels, users] = await Promise.all([
        this.fetchSlackData(`${baseUrl}/${endpoints.channels}`, headers),
        this.fetchSlackData(`${baseUrl}/${endpoints.users}`, headers)
      ]);

      const syncedData = {
        channels: channels.channels,
        users: users.members
      };

      await this.storeSyncedData(schoolId, 'SLACK', syncedData);
      return { status: 'success', message: 'Slack sync completed', data: syncedData };
    } catch (error) {
      console.error('Slack sync error:', error);
      throw error;
    }
  }

  async syncParentSquare(schoolId, credentials) {
    try {
      const { apiKey, schoolToken } = credentials;
      const baseUrl = 'https://www.parentsquare.com/api/v1';
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'X-School-Token': schoolToken,
        'Accept': 'application/json'
      };

      // Fetch data from all endpoints
      const endpoints = SUPPORTED_PLATFORMS.PARENTSQUARE.endpoints;
      const [posts, groups, users] = await Promise.all([
        this.fetchParentSquareData(`${baseUrl}${endpoints.posts}`, headers),
        this.fetchParentSquareData(`${baseUrl}${endpoints.groups}`, headers),
        this.fetchParentSquareData(`${baseUrl}${endpoints.users}`, headers)
      ]);

      const syncedData = {
        posts,
        groups,
        users
      };

      await this.storeSyncedData(schoolId, 'PARENTSQUARE', syncedData);
      return { status: 'success', message: 'ParentSquare sync completed', data: syncedData };
    } catch (error) {
      console.error('ParentSquare sync error:', error);
      throw error;
    }
  }

  // Helper methods for API calls
  async fetchPowerSchoolData(url, token) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch PowerSchool data from ${url}`);
    return response.json();
  }

  async fetchCanvasData(url, token) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch Canvas data from ${url}`);
    return response.json();
  }

  async storeSyncedData(schoolId, platform, data) {
    try {
      const syncRef = doc(db, 'schools', schoolId, 'integrations', platform);
      await updateDoc(syncRef, {
        syncedData: data,
        lastSyncTime: new Date(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error storing synced data:', error);
      throw error;
    }
  }

  // Security utilities
  async generateSignature(input, secret) {
    return await generateHmac(input, secret);
  }

  encryptCredentials(credentials) {
    // Simple encryption for demo - in production, use proper encryption
    return btoa(JSON.stringify(credentials));
  }

  decryptCredentials(encryptedCredentials) {
    // Simple decryption for demo - in production, use proper decryption
    return JSON.parse(atob(encryptedCredentials));
  }

  // Additional helper methods for API calls
  async fetchCleverData(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch Clever data from ${url}`);
    return response.json();
  }

  async fetchBlackboardData(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch Blackboard data from ${url}`);
    return response.json();
  }

  async fetchSlackData(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch Slack data from ${url}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Slack API error');
    return data;
  }

  async fetchParentSquareData(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch ParentSquare data from ${url}`);
    return response.json();
  }

  generateJWT(payload, secret) {
    // Simple JWT implementation (use a proper JWT library in production)
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
    const signature = this.generateSignature(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

export const integrationManager = new IntegrationManager(); 