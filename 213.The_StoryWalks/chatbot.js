document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chat-box');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Show chat box by default
    chatBox.style.display = 'flex';

    // Add welcome message
    appendMessage('Hello! I\'m your cultural travel assistant. How can I help you today?', 'Bot');

    closeBtn.addEventListener('click', () => {
        chatBox.style.display = 'none';
        // Notify parent window to hide iframe
        if (window.parent !== window) {
            window.parent.postMessage('close-chat', '*');
        }
    });

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMessage(content, sender) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${sender}:</strong> ${content}`;
        chatMessages.appendChild(p);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const prompt = chatInput.value.trim();
        if (!prompt) return;
        
        appendMessage(prompt, 'You');
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('p');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = '<strong>Bot:</strong> <span class="typing">Typing...</span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);
            
            // Format and display the response
            const formattedResponse = data.response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join('<br>');
            
            appendMessage(formattedResponse, 'Bot');
        } catch (error) {
            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);
            
            appendMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'Bot');
            console.error('Error:', error);
        }
    }

    // Listen for messages from parent window
    window.addEventListener('message', function(event) {
        if (event.data === 'toggle-chat') {
            chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
        }
    });
}); 