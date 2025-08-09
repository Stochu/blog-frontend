import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  FileText, 
  Plus,
  Eye 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import { Post } from '../types/types';
import DOMPurify from 'dompurify';

const DraftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts();
    }
  }, [isAuthenticated]);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDrafts();
      setDrafts(response);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (draftId: string) => {
    navigate(`/posts/${draftId}/edit`);
  };

  const handleView = (draftId: string) => {
    navigate(`/posts/${draftId}`);
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(draftId);
      await apiService.deletePost(draftId);
      await fetchDrafts(); // Refresh the list
    } catch (err: any) {
      setError(err?.message || 'Failed to delete draft');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const createExcerpt = (content: string) => {
    // First sanitize the HTML
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'br'],
      ALLOWED_ATTR: []
    });
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    // Get the text content and limit it
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    textContent = textContent.trim();
    
    // Limit to roughly 150 characters, ending at the last complete word
    if (textContent.length > 150) {
      textContent = textContent.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...';
    }
    
    return textContent;
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

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
                    <div key={index} className="h-48 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-3xl font-bold">Draft Posts</h1>
                <p className="text-default-500 mt-1">
                  Your unpublished blog posts and works in progress
                </p>
              </div>
              
              <Button
                color="primary"
                startContent={<Plus size={20} />}
                onPress={() => navigate('/posts/new')}
              >
                New Post
              </Button>
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
                onPress={fetchDrafts}
                className="mt-2"
              >
                Try Again
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Drafts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                      {draft.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Chip 
                        color="warning"
                        variant="flat"
                        size="sm"
                        startContent={<FileText size={14} />}
                      >
                        DRAFT
                      </Chip>
                    </div>
                  </div>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Draft actions">
                      <DropdownItem
                        key="edit"
                        startContent={<Edit3 size={16} />}
                        onPress={() => handleEdit(draft.id)}
                      >
                        Edit Draft
                      </DropdownItem>
                      <DropdownItem
                        key="view"
                        startContent={<Eye size={16} />}
                        onPress={() => handleView(draft.id)}
                      >
                        Preview
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                        onPress={() => handleDelete(draft.id)}
                        isDisabled={deleting === draft.id}
                      >
                        {deleting === draft.id ? 'Deleting...' : 'Delete'}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                <p className="text-sm text-default-600 line-clamp-4 mb-4">
                  {createExcerpt(draft.content)}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip color="primary" variant="flat" size="sm">
                    {draft.category.name}
                  </Chip>
                  {draft.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag.id} variant="bordered" size="sm">
                      {tag.name}
                    </Chip>
                  ))}
                  {draft.tags.length > 2 && (
                    <Chip variant="bordered" size="sm">
                      +{draft.tags.length - 2}
                    </Chip>
                  )}
                </div>
              </CardBody>

              <CardFooter className="pt-0 flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(draft.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{draft.readingTime} min</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<Edit3 size={14} />}
                  onPress={() => handleEdit(draft.id)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {drafts.length === 0 && !loading && (
          <Card>
            <CardBody className="text-center py-12">
              <FileText size={64} className="mx-auto text-default-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Drafts Yet</h3>
              <p className="text-default-500 mb-6">
                Start writing your first blog post. All unpublished posts will appear here.
              </p>
              <Button
                color="primary"
                startContent={<Plus size={20} />}
                onPress={() => navigate('/posts/new')}
              >
                Create Your First Post
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DraftsPage;