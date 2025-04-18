document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const blogPosts = document.getElementById('blogPosts');
    const createBlogBtn = document.getElementById('createBlogBtn');
    const blogModal = document.getElementById('blogModal');
    const closeModal = document.querySelector('.close');
    const blogForm = document.getElementById('blogForm');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-container button');

    // State
    let allBlogs = [];
    let filteredBlogs = [];

    // Initialize
    loadBlogs();

    // Event Listeners
    createBlogBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModal);
    blogForm.addEventListener('submit', handleBlogSubmit);
    categoryFilter.addEventListener('change', filterBlogs);
    sortFilter.addEventListener('change', filterBlogs);
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Functions
    async function loadBlogs() {
        try {
            const response = await fetch('/api/blogs');
            if (!response.ok) {
                throw new Error('Failed to load blogs');
            }
            allBlogs = await response.json();
            filteredBlogs = [...allBlogs];
            displayBlogs(filteredBlogs);
        } catch (error) {
            showError('Failed to load blogs. Please try again later.');
        }
    }

    function displayBlogs(blogs) {
        blogPosts.innerHTML = '';
        
        if (blogs.length === 0) {
            blogPosts.innerHTML = '<p class="no-blogs">No blogs found matching your criteria.</p>';
            return;
        }

        blogs.forEach(blog => {
            const blogPost = createBlogPost(blog);
            blogPosts.appendChild(blogPost);
        });
    }

    function createBlogPost(blog) {
        const article = document.createElement('article');
        article.className = 'blog-post';
        article.dataset.id = blog.id;

        const image = document.createElement('img');
        image.className = 'blog-post-image';
        image.src = blog.image || 'images/default-blog.jpg';
        image.alt = blog.title;

        const content = document.createElement('div');
        content.className = 'blog-post-content';

        const category = document.createElement('span');
        category.className = 'blog-post-category';
        category.textContent = blog.category;

        const title = document.createElement('h3');
        title.className = 'blog-post-title';
        title.textContent = blog.title;

        const excerpt = document.createElement('p');
        excerpt.className = 'blog-post-excerpt';
        excerpt.textContent = blog.excerpt;

        const meta = document.createElement('div');
        meta.className = 'blog-post-meta';

        const author = document.createElement('div');
        author.className = 'blog-post-author';
        author.innerHTML = `
            <img src="${blog.author.avatar}" alt="${blog.author.name}">
            <span>${blog.author.name}</span>
        `;

        const date = document.createElement('span');
        date.className = 'blog-post-date';
        date.textContent = formatDate(blog.date);

        meta.appendChild(author);
        meta.appendChild(date);

        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(excerpt);
        content.appendChild(meta);

        article.appendChild(image);
        article.appendChild(content);

        article.addEventListener('click', () => {
            window.location.href = `/blog/${blog.id}`;
        });

        return article;
    }

    function openModal() {
        blogModal.style.display = 'block';
    }

    function closeModal() {
        blogModal.style.display = 'none';
    }

    async function handleBlogSubmit(e) {
        e.preventDefault();

        const formData = new FormData(blogForm);
        const blogData = {
            title: formData.get('blogTitle'),
            category: formData.get('blogCategory'),
            content: formData.get('blogContent'),
            tags: formData.get('blogTags').split(',').map(tag => tag.trim()),
            image: formData.get('blogImage')
        };

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            });

            if (!response.ok) {
                throw new Error('Failed to create blog');
            }

            const newBlog = await response.json();
            allBlogs.unshift(newBlog);
            filteredBlogs = [...allBlogs];
            displayBlogs(filteredBlogs);
            closeModal();
            blogForm.reset();
            alert('Blog published successfully!');
        } catch (error) {
            showError('Failed to publish blog. Please try again.');
        }
    }

    function filterBlogs() {
        const category = categoryFilter.value;
        const sort = sortFilter.value;

        filteredBlogs = allBlogs.filter(blog => {
            if (category === 'all') return true;
            return blog.category === category;
        });

        sortBlogs(sort);
        displayBlogs(filteredBlogs);
    }

    function sortBlogs(sort) {
        switch (sort) {
            case 'newest':
                filteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filteredBlogs.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                filteredBlogs.sort((a, b) => b.views - a.views);
                break;
        }
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            filteredBlogs = [...allBlogs];
            filterBlogs();
            return;
        }

        filteredBlogs = allBlogs.filter(blog => {
            return (
                blog.title.toLowerCase().includes(query) ||
                blog.content.toLowerCase().includes(query) ||
                blog.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });

        displayBlogs(filteredBlogs);
    }

    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error';
        errorElement.textContent = message;
        blogPosts.appendChild(errorElement);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === blogModal) {
            closeModal();
        }
    });
}); 