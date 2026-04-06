import Post from '../models/Post.js';

// @desc    Get all community posts
// @route   GET /api/community
// @access  Private
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name email skillLevel')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

// @desc    Create a new post
// @route   POST /api/community
// @access  Private
export const createPost = async (req, res) => {
    const { type, title, content, tags } = req.body;

    if (!type || !title || !content) {
        return res.status(400).json({ message: 'Please provide type, title, and content' });
    }

    try {
        const post = new Post({
            author: req.user._id,
            type,
            title,
            content,
            tags: tags || []
        });

        const createdPost = await post.save();
        
        // Populate author to return full object immediately to frontend
        const populatedPost = await Post.findById(createdPost._id).populate('author', 'name email skillLevel');
        
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

// @desc    Like or Unlike a post
// @route   PUT /api/community/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already liked the post
        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            post.likes.push(req.user._id);
        }

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/community/:id/comment
// @access  Private
export const addComment = async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.user._id,
            text
        };

        post.comments.push(newComment);
        await post.save();

        const populatedPost = await Post.findById(req.params.id).populate('comments.user', 'name');
        
        res.status(201).json(populatedPost.comments);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
