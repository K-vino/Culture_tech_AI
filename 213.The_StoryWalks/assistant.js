document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('assistantPrompt');
    const languageSelect = document.getElementById('langSelect');
    const outputDiv = document.getElementById('assistantOutput');
    const textOutput = document.getElementById('assistantText');
    const audioPlayer = document.getElementById('assistantAudio');

    // Add loading state
    function setLoading(isLoading) {
        const button = document.querySelector('.btn-primary');
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-volume-up"></i> Translate & Narrate';
        }
    }

    // Add error handling
    function showError(message) {
        outputDiv.style.display = 'block';
        textOutput.innerHTML = `<span class="error">${message}</span>`;
        audioPlayer.src = '';
    }

    // Main function to get narration
    async function getNarration() {
        const prompt = promptInput.value.trim();
        const language = languageSelect.value;

        if (!prompt) {
            showError('Please enter a question about culture.');
            return;
        }

        setLoading(true);
        outputDiv.style.display = 'none';

        try {
            const response = await fetch('http://127.0.0.1:5000/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, language })
            });

            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }

            // Get the audio blob
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Update the UI
            outputDiv.style.display = 'block';
            textOutput.innerHTML = `Language: ${language.toUpperCase()}<br><br>${prompt}`;
            audioPlayer.src = url;
            audioPlayer.load();

            // Clean up the URL when audio is loaded
            audioPlayer.onloadeddata = () => {
                URL.revokeObjectURL(url);
            };

        } catch (error) {
            showError('Failed to get response: ' + error.message);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    // Add event listeners
    document.querySelector('.btn-primary').addEventListener('click', getNarration);

    // Add keyboard support
    promptInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getNarration();
        }
    });

    // Add language change handler
    languageSelect.addEventListener('change', function() {
        outputDiv.style.display = 'none';
    });
}); 