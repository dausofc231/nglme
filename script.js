const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const buttonContainer = document.querySelector('.button-container');

// Store original position
const originalLeft = 0;
const originalTop = 0;

// Telegram bot configuration
const BOT_TOKEN = '7219847642:AAEIXVnZH9qAN74cmZlbUSLI9BVHbXyKme0';
const CHAT_ID = '6632327942';

messageInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        // Return button to original position if there's text
        sendButton.style.left = originalLeft + 'px';
        sendButton.style.top = originalTop + 'px';
    }
});

function generateRandomText() {
    const randomIndex = Math.floor(Math.random() * randomTexts.length);
    messageInput.value = randomTexts[randomIndex];
    // Return button to original position when text is generated
    sendButton.style.left = originalLeft + 'px';
    sendButton.style.top = originalTop + 'px';
}

async function sendToTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const params = new URLSearchParams();
        params.append('chat_id', CHAT_ID);
        params.append('text', message);
        
        const response = await fetch(url, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

sendButton.addEventListener('click', async function(e) {
    const message = messageInput.value.trim();
    
    if (message === '') {
        e.preventDefault();
        
        // Calculate small random movement (max 30px in any direction)
        const randomX = (Math.random() * 60 - 30); // -30 to +30
        const randomY = (Math.random() * 60 - 30); // -30 to +30
        
        // Move button slightly from original position
        sendButton.style.left = (originalLeft + randomX) + 'px';
        sendButton.style.top = (originalTop + randomY) + 'px';
    } else {
        e.preventDefault();
        
        // Add click animation
        sendButton.style.transform = 'scale(0.95)';
        sendButton.style.transition = 'transform 0.1s ease';
        
        // Send message to Telegram
        const success = await sendToTelegram(message);
        
        // Reset button animation
        setTimeout(() => {
            sendButton.style.transform = 'scale(1)';
        }, 100);
        
        if (success) {
            // Clear the textarea after successful send
            messageInput.value = '';
        } else {
            // Optional: Handle failed send (you can add visual feedback if needed)
            console.log('Failed to send message');
        }
    }
});
