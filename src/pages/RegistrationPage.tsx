// src/pages/RegistrationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Input, Button } from '@nextui-org/react';
import { useAuth } from '../components/AuthContext';
import { RegisterRequest } from '../types/types';

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RegisterRequest) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      // Handle specific validation errors from backend
      if (err?.errors) {
        const backendErrors: Partial<RegisterRequest> = {};
        err.errors.forEach((error: { field: string; message: string }) => {
          backendErrors[error.field as keyof RegisterRequest] = error.message;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ email: err?.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="mt-8">
          <CardHeader className="pb-0 pt-6">
            <div className="w-full text-center">
              <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Join our blog community today
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onValueChange={handleChange('name')}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                isRequired
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onValueChange={handleChange('email')}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                isRequired
              />

              <Input
                label="Password"
                placeholder="Create a password"
                type="password"
                value={formData.password}
                onValueChange={handleChange('password')}
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                isRequired
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                type="password"
                value={formData.confirmPassword}
                onValueChange={handleChange('confirmPassword')}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                isRequired
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationPage;
