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
import { Plus, MoreVertical, Trash2, Tag as TagIcon, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import { TagDTO } from '../types/types';

const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [tags, setTags] = useState<TagDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form state
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTags();
      setTags(response);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTagName = () => {
    const tagName = currentTagInput.trim();
    
    if (!tagName) {
      setFormError('Tag name cannot be empty');
      return;
    }

    if (newTagNames.includes(tagName)) {
      setFormError('Tag already added');
      return;
    }

    if (newTagNames.length >= 10) {
      setFormError('Maximum 10 tags allowed');
      return;
    }

    setNewTagNames([...newTagNames, tagName]);
    setCurrentTagInput('');
    setFormError('');
  };

  const handleRemoveTagName = (tagToRemove: string) => {
    setNewTagNames(newTagNames.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTagName();
    }
  };

  const handleCreateTags = async () => {
    if (newTagNames.length === 0) {
      setFormError('At least one tag is required');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      
      await apiService.createTags(newTagNames);
      setNewTagNames([]);
      setCurrentTagInput('');
      onClose();
      await fetchTags(); // Refresh the list
      
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create tags');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(tagId);
      await apiService.deleteTag(tagId);
      await fetchTags(); // Refresh the list
    } catch (err: any) {
      setError(err?.message || 'Failed to delete tag');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewPosts = (tagId: string) => {
    navigate(`/?tagId=${tagId}`);
  };

  const handleModalClose = () => {
    setNewTagNames([]);
    setCurrentTagInput('');
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
                <div className="flex flex-wrap gap-2">
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="h-8 bg-gray-200 rounded-full w-20"></div>
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
                  <h1 className="text-3xl font-bold">Tags</h1>
                  <p className="text-default-500 mt-1">
                    Label and categorize your blog posts with tags
                  </p>
                </div>
                
                {isAuthenticated && (
                  <Button
                    color="primary"
                    startContent={<Plus size={20} />}
                    onPress={onOpen}
                  >
                    New Tags
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
                  onPress={fetchTags}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Tags Display */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="relative group">
                    <Chip
                      variant="flat"
                      size="lg"
                      startContent={<TagIcon size={16} />}
                      className="cursor-pointer hover:shadow-md transition-shadow pr-12"
                      onClick={() => handleViewPosts(tag.id)}
                    >
                      <span className="font-medium">{tag.name}</span>
                      <span className="ml-2 text-xs text-default-500">
                        ({tag.postCount || 0})
                      </span>
                    </Chip>
                    
                    {isAuthenticated && (
                      <Dropdown>
                        <DropdownTrigger>
                          <Button 
                            isIconOnly 
                            variant="light" 
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Tag actions">
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 size={16} />}
                            onPress={() => handleDeleteTag(tag.id)}
                            isDisabled={deleting === tag.id}
                          >
                            {deleting === tag.id ? 'Deleting...' : 'Delete'}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {tags.length === 0 && (
                <div className="text-center py-12">
                  <TagIcon size={64} className="mx-auto text-default-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Tags Yet</h3>
                  <p className="text-default-500 mb-6">
                    Create your first tags to help organize and label your blog posts.
                  </p>
                  {isAuthenticated && (
                    <Button
                      color="primary"
                      startContent={<Plus size={20} />}
                      onPress={onOpen}
                    >
                      Create First Tags
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Create Tags Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
        <ModalContent>
          <ModalHeader>Create New Tags</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Tag Input */}
              <div className="flex gap-2">
                <Input
                  label="Tag Name"
                  placeholder="Enter tag name"
                  value={currentTagInput}
                  onValueChange={setCurrentTagInput}
                  onKeyDown={handleKeyPress}
                  isInvalid={!!formError}
                  errorMessage={formError}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  variant="flat"
                  onPress={handleAddTagName}
                  isDisabled={!currentTagInput.trim() || newTagNames.length >= 10}
                >
                  Add
                </Button>
              </div>

              {/* Added Tags */}
              {newTagNames.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags to create:</p>
                  <div className="flex flex-wrap gap-2">
                    {newTagNames.map((tagName) => (
                      <Chip
                        key={tagName}
                        variant="flat"
                        endContent={
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="w-4 h-4 min-w-4"
                            onPress={() => handleRemoveTagName(tagName)}
                          >
                            <X size={12} />
                          </Button>
                        }
                      >
                        {tagName}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-xs text-default-500">
                    {newTagNames.length}/10 tags
                  </p>
                </div>
              )}

              <p className="text-sm text-default-500">
                Press Enter or click Add to add multiple tags. You can create up to 10 tags at once.
              </p>
            </div>
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
              onPress={handleCreateTags}
              isLoading={creating}
              isDisabled={newTagNames.length === 0}
            >
              Create {newTagNames.length} Tag{newTagNames.length !== 1 ? 's' : ''}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TagsPage;