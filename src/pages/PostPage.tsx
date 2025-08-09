import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react';
import { 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  Edit3, 
  Trash2, 
  MoreVertical,
  ArrowLeft 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import { Post } from '../types/types';
import DOMPurify from 'dompurify';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Post ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getPost(id);
        setPost(response);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleEdit = () => {
    if (post) {
      navigate(`/posts/${post.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      setDeleting(true);
      await apiService.deletePost(post.id);
      onClose();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete post');
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const createSanitizedHTML = (content: string) => ({
  __html: DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p','br','strong','em','u','strike',
      'h1','h2','h3','ul','ol','li',
      'blockquote','code','pre','a'
    ],
    // List all permitted attributes here:
    ALLOWED_ATTR: ['href', 'title', 'class']
  })
});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="w-full">
            <CardBody>
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="w-full">
            <CardBody className="text-center py-12">
              <p className="text-danger text-lg">{error || 'Post not found'}</p>
              <Button 
                className="mt-4" 
                variant="flat" 
                startContent={<ArrowLeft size={20} />}
                onPress={() => navigate('/')}
              >
                Back to Home
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Navigation */}
          <Button 
            variant="light" 
            startContent={<ArrowLeft size={20} />}
            onPress={() => navigate('/')}
            className="mb-6"
          >
            Back to Posts
          </Button>

          <Card className="w-full">
            <CardHeader className="flex flex-col items-start space-y-4 pb-6">
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {post.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm text-default-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Published {formatDate(post.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{post.readingTime} min read</span>
                    </div>
                    
                    <span>by {post.author.name}</span>
                  </div>

                  {/* Post Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <Chip 
                      color={post.status === 'PUBLISHED' ? 'success' : 'warning'}
                      variant="flat"
                      size="sm"
                    >
                      {post.status}
                    </Chip>
                  </div>
                </div>

                {/* Action Menu */}
                {isAuthenticated && (
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light">
                        <MoreVertical size={20} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Post actions">
                      <DropdownItem
                        key="edit"
                        startContent={<Edit3 size={16} />}
                        onPress={handleEdit}
                      >
                        Edit Post
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                        onPress={onOpen}
                      >
                        Delete Post
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                )}
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 w-full">
                <Chip color="primary" variant="flat">
                  {post.category.name}
                </Chip>
                
                {post.tags.map((tag) => (
                  <Chip 
                    key={tag.id}
                    variant="bordered"
                    startContent={<TagIcon size={14} />}
                  >
                    {tag.name}
                  </Chip>
                ))}
              </div>
            </CardHeader>

            <CardBody>
              {/* Post Content */}
              <div 
                className="prose prose-gray max-w-none prose-lg
                  prose-headings:text-foreground prose-p:text-foreground-600
                  prose-strong:text-foreground prose-em:text-foreground-600
                  prose-code:text-foreground prose-pre:bg-gray-100
                  prose-blockquote:border-l-primary prose-blockquote:text-foreground-600
                  prose-a:text-primary hover:prose-a:text-primary-600"
                dangerouslySetInnerHTML={createSanitizedHTML(post.content)}
              />
            </CardBody>
          </Card>

          {/* Updated Info */}
          {post.updatedAt !== post.createdAt && (
            <Card className="mt-4">
              <CardBody className="py-3">
                <p className="text-sm text-default-500">
                  Last updated: {formatDate(post.updatedAt)}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete "{post.title}"?</p>
            <p className="text-sm text-danger">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleDelete} 
              isLoading={deleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PostPage;