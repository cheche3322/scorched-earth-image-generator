class ImageGenerator {
    constructor() {
        this.endpoint = "https://your-domain.com/api/generate-image.php";  // Placeholder endpoint
        this.rateLimit = {
            maxAttempts: 3,
            resetTime: 3600000,  // 1 hour
            attempts: new Map()
        };
    }

    checkRateLimit(email) {
        const now = Date.now();
        const userAttempts = this.rateLimit.attempts.get(email) || { count: 0, lastReset: now };

        if (now - userAttempts.lastReset > this.rateLimit.resetTime) {
            userAttempts.count = 0;
            userAttempts.lastReset = now;
        }

        return userAttempts.count < this.rateLimit.maxAttempts;
    }

    updateRateLimit(email) {
        const userAttempts = this.rateLimit.attempts.get(email) || { count: 0, lastReset: Date.now() };
        userAttempts.count++;
        this.rateLimit.attempts.set(email, userAttempts);
    }

    async generateImage(prompt) {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            throw new Error('Please subscribe first to generate images');
        }

        if (!this.checkRateLimit(userEmail)) {
            throw new Error('Generation limit reached. Please try again in 1 hour');
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    email: userEmail
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            this.updateRateLimit(userEmail);
            return await response.blob();
        } catch (error) {
            throw new Error('Image generation failed. Please try again');
        }
    }
}

const imageGen = new ImageGenerator();

document.getElementById('generate-button').addEventListener('click', async function() {
    const prompt = document.getElementById('prompt').value.trim();
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    const generatedImage = document.getElementById('generated-image');
    const downloadButton = document.getElementById('download-button');
    const regenerateButton = document.getElementById('regenerate-button');

    if (!prompt) {
        errorMessage.textContent = 'Please describe the art you want to create';
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';
    loadingSpinner.style.display = 'block';
    generatedImage.style.display = 'none';
    downloadButton.style.display = 'none';
    regenerateButton.style.display = 'none';
    this.disabled = true;

    try {
        const imageBlob = await imageGen.generateImage(prompt);
        const imageUrl = URL.createObjectURL(imageBlob);

        generatedImage.onload = function() {
            generatedImage.style.display = 'block';
            downloadButton.style.display = 'inline-block';
            regenerateButton.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            document.getElementById('generate-button').disabled = false;
        };
        generatedImage.src = imageUrl;

        downloadButton.onclick = function() {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'scorched-earth-masterpiece.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        regenerateButton.onclick = function() {
            document.getElementById('generate-button').click();
        };
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        this.disabled = false;
    }
});

document.getElementById('mc-embedded-subscribe-form').addEventListener('submit', function(event) {
    const email = document.getElementById('mce-EMAIL').value;
    localStorage.setItem('userEmail', email);
});
