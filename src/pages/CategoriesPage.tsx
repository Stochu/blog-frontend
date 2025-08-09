import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import { Plus, MoreVertical, Trash2, Folder } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import { Category } from '../types/types';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError('Category name is required');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      
      await apiService.createCategory(newCategoryName.trim());
      setNewCategoryName('');
      onClose();
      await fetchCategories(); // Refresh the list
      
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(categoryId);
      await apiService.deleteCategory(categoryId);
      await fetchCategories(); // Refresh the list
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewPosts = (categoryId: string) => {
    navigate(`/?categoryId=${categoryId}`);
  };

  const handleModalClose = () => {
    setNewCategoryName('');
    setFormError('');
    onClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="w-full">
            <CardBody>
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <h1 className="text-3xl font-bold">Categories</h1>
                  <p className="text-default-500 mt-1">
                    Organize your blog posts by categories
                  </p>
                </div>
                
                {isAuthenticated && (
                  <Button
                    color="primary"
                    startContent={<Plus size={20} />}
                    onPress={onOpen}
                  >
                    New Category
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-6">
              <CardBody>
                <p className="text-danger">{error}</p>
                <Button 
                  variant="light" 
                  size="sm" 
                  onPress={fetchCategories}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                isPressable
                onPress={() => handleViewPosts(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Folder className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-default-500">
                          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                        </p>
                      </div>
                    </div>

                    {isAuthenticated && (
                      <Dropdown>
                        <DropdownTrigger>
                          <Button 
                            isIconOnly 
                            variant="light" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Category actions">
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 size={16} />}
                            onPress={() => handleDeleteCategory(category.id)}  // No event parameter
                            isDisabled={deleting === category.id}
                          >
                            {deleting === category.id ? 'Deleting...' : 'Delete'}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="pt-0">
                  <Chip 
                    color="primary" 
                    variant="flat" 
                    size="sm"
                  >
                    {category.postCount} posts
                  </Chip>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {categories.length === 0 && !loading && (
            <Card>
              <CardBody className="text-center py-12">
                <Folder size={64} className="mx-auto text-default-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Categories Yet</h3>
                <p className="text-default-500 mb-6">
                  Create your first category to start organizing your blog posts.
                </p>
                {isAuthenticated && (
                  <Button
                    color="primary"
                    startContent={<Plus size={20} />}
                    onPress={onOpen}
                  >
                    Create First Category
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={newCategoryName}
              onValueChange={setNewCategoryName}
              isInvalid={!!formError}
              errorMessage={formError}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={handleModalClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleCreateCategory}
              isLoading={creating}
            >
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CategoriesPage;