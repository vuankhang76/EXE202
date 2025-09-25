import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApiCall, useAuthApiCall, useSaveApiCall } from '@/hooks/useApiCall';
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';
import { apiUtils } from '@/api/axios';

// Mock API functions for demonstration
const fetchUserProfile = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { id: 1, name: 'John Doe', email: 'john@example.com' };
};

const saveUserProfile = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: 'Profile saved successfully' };
};

export default function ExampleApiUsage() {
  const { isLoading } = useLoading();

  // Example 1: Basic API call with manual loading management
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    execute: loadProfile
  } = useApiCall(fetchUserProfile, {
    loadingKey: LOADING_KEYS.GET_USER_PROFILE,
    successMessage: 'Profile loaded successfully!',
    showSuccessToast: true
  });

  // Example 2: Save operation with automatic success message
  const { execute: saveProfile, isLoading: isSavingProfile } = useSaveApiCall(
    saveUserProfile,
    {
      successMessage: 'Profile updated successfully!',
      onSuccess: () => {
        console.log('Profile saved, refreshing data...');
        loadProfile();
      }
    }
  );

  // Example 3: Using specific loading keys
  const handleCustomOperation = async () => {
    const customKey = LOADING_KEYS.CUSTOM('user-operation');
    try {
      // Manual loading management
      const { startLoading, stopLoading } = useLoading();
      startLoading(customKey);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      stopLoading(customKey);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Loading System Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Example 1: Profile Loading */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Profile Management</h3>
            <div className="flex gap-2">
              <Button 
                onClick={() => loadProfile()}
                disabled={isLoadingProfile}
              >
                {isLoadingProfile ? (
                  <>
                    <ButtonLoadingSpinner />
                    Loading Profile...
                  </>
                ) : (
                  'Load Profile'
                )}
              </Button>
              
              <Button 
                onClick={() => saveProfile({ name: 'Updated Name' })}
                disabled={isSavingProfile}
                variant="outline"
              >
                {isSavingProfile ? (
                  <>
                    <ButtonLoadingSpinner />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
            
            {isLoadingProfile && (
              <div className="p-4 border rounded-md">
                <LoadingSpinner size="sm" showText text="Loading user profile..." />
              </div>
            )}
            
            {userProfile && !isLoadingProfile && (
              <div className="p-4 border rounded-md bg-green-50">
                <h4 className="font-medium">Profile Data:</h4>
                <pre className="text-sm mt-2">{JSON.stringify(userProfile, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Example 2: Global Loading State */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Global Loading State</h3>
            <p className="text-sm text-muted-foreground">
              Any loading operation: {isLoading() ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-muted-foreground">
              Profile loading: {isLoading(LOADING_KEYS.GET_USER_PROFILE) ? 'Active' : 'Inactive'}
            </p>
          </div>

          {/* Example 3: Different Loading Sizes */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading Spinner Variants</h3>
            <div className="flex items-center gap-4">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
            <div className="flex items-center gap-4">
              <LoadingSpinner size="md" variant="primary" showText text="Primary" />
              <LoadingSpinner size="md" variant="white" showText text="White" className="bg-black p-2 rounded" />
            </div>
          </div>

          {/* Example 4: Real API Usage */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Real API Example</h3>
            <Button
              onClick={async () => {
                try {
                  // This will automatically show loading via axios interceptors
                  const response = await apiUtils.get('/api/example-endpoint');
                  console.log('API Response:', response);
                } catch (error) {
                  console.error('API Error:', error);
                }
              }}
            >
              Call Real API (with automatic loading)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
