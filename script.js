// Comments functionality for wedding invitation
document.addEventListener('DOMContentLoaded', function() {
    // Auto-scroll functionality
    let autoScrollActive = true;
    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per 50ms
    const scrollInterval = 50; // milliseconds
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    function autoScroll() {
        if (autoScrollActive) {
            scrollPosition += scrollSpeed;
            
            // If reached bottom, reset to top
            if (scrollPosition >= maxScroll) {
                scrollPosition = 0;
            }
            
            window.scrollTo(0, scrollPosition);
        }
    }

    const autoScrollTimer = setInterval(autoScroll, scrollInterval);

    // Pause auto-scroll when user manually scrolls
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        autoScrollActive = false;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // Resume auto-scroll after 3 seconds of inactivity
            scrollPosition = window.scrollY;
            autoScrollActive = true;
        }, 3000);
    }, { passive: true });

    // Pause auto-scroll when user interacts with form
    const commentText = document.getElementById('comment-text');
    commentText.addEventListener('focus', function() {
        autoScrollActive = false;
    });
    
    commentText.addEventListener('blur', function() {
        setTimeout(function() {
            scrollPosition = window.scrollY;
            autoScrollActive = true;
        }, 500);
    });

    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');

    // Load existing comments
    loadComments();

    // Handle form submission
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const message = commentText.value.trim();
        if (!message) return;

        try {
            // Get user's IP address
            const ip = await getUserIP();

            // Create comment object
            const comment = {
                id: Date.now(),
                author: ip,
                message: message,
                timestamp: new Date().toISOString()
            };

            // Save comment
            saveComment(comment);

            // Clear form
            commentText.value = '';

            // Reload comments
            loadComments();

        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Sorry, there was an error posting your comment. Please try again.');
        }
    });

    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'Anonymous';
        }
    }

    function saveComment(comment) {
        const comments = getComments();
        comments.push(comment);
        localStorage.setItem('wedding-comments', JSON.stringify(comments));
    }

    function getComments() {
        const comments = localStorage.getItem('wedding-comments');
        return comments ? JSON.parse(comments) : [];
    }

    function loadComments() {
        const comments = getComments();
        commentsList.innerHTML = '';

        if (comments.length === 0) {
            commentsList.innerHTML = '<p>No messages yet. Be the first to leave a wish!</p>';
            return;
        }

        // Sort comments by timestamp (newest first)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';

            const formattedDate = new Date(comment.timestamp).toLocaleString();

            commentDiv.innerHTML = `
                <div class="author">${comment.author}</div>
                <div class="timestamp">${formattedDate}</div>
                <div class="message">${escapeHtml(comment.message)}</div>
            `;

            commentsList.appendChild(commentDiv);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
