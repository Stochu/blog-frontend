import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button } from '@nextui-org/react';
import { ArrowLeft, Save } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import PostForm from '../components/PostForm';
import { Post, Category, TagDTO, CreatePostRequestDTO, UpdatePostRequestDTO } from '../types/types';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postData, categoriesData, tagsData] = await Promise.all([
          id ? apiService.getPost(id) : Promise.resolve(null),
          apiService.getCategories(),
          apiService.getTags()
        ]);

        setPost(postData);
        setCategories(categoriesData);
        setAvailableTags(tagsData);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: any;
  }) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (id && post) {
        // Update existing post
        const updateData: UpdatePostRequestDTO = {
          id: id,
          title: postData.title,
          content: postData.content,
          categoryId: postData.categoryId,
          tagIds: postData.tagIds,
          status: postData.status
        };

        const updatedPost = await apiService.updatePost(id, updateData);
        navigate(`/posts/${updatedPost.id}`);
      } else {
        // Create new post
        const createData: CreatePostRequestDTO = {
          title: postData.title,
          content: postData.content,
          categoryId: postData.categoryId,
          tagIds: postData.tagIds,
          status: postData.status
        };

        const newPost = await apiService.createPost(createData);
        navigate(`/posts/${newPost.id}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save post');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (post) {
      navigate(`/posts/${post.id}`);
    } else {
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="w-full">
            <CardBody>
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !post && id) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="w-full">
            <CardBody className="text-center py-12">
              <p className="text-danger text-lg">{error}</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="light" 
            startContent={<ArrowLeft size={20} />}
            onPress={handleCancel}
            className="mb-4"
          >
            {post ? 'Back to Post' : 'Back to Home'}
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <h1 className="text-2xl font-bold">
                    {post ? 'Edit Post' : 'Create New Post'}
                  </h1>
                  <p className="text-default-500 mt-1">
                    {post ? 'Update your existing blog post' : 'Write and publish a new blog post'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="light" 
                    onPress={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6">
            <CardBody>
              <p className="text-danger">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Post Form */}
        <Card>
          <CardBody>
            <PostForm
              initialPost={post}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              categories={categories}
              availableTags={availableTags}
              isSubmitting={submitting}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EditPostPage;