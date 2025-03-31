const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const buttonContainer = document.querySelector('.button-container');

// Store original position
const originalLeft = 0;
const originalTop = 0;

// Telegram configuration
const BOT_TOKEN = '7219847642:AAEIXVnZH9qAN74cmZlbUSLI9BVHbXyKme0';
const CHAT_ID = '6632327942';

// Message queue and sending state
let isSending = false;
let messageCount = localStorage.getItem('message_count') || 1;

messageInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        sendButton.style.left = originalLeft + 'px';
        sendButton.style.top = originalTop + 'px';
    }
});

function generateRandomText() {
    if (isSending) return;
    
    const randomIndex = Math.floor(Math.random() * randomTexts.length);
    messageInput.value = randomTexts[randomIndex];
    sendButton.style.left = originalLeft + 'px';
    sendButton.style.top = originalTop + 'px';
}

function formatTimestamp() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    const time = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
    
    return `_________________\n> ${date} | ${days[now.getDay()]}\n> ${time} | ke? ${messageCount}\n_________________\n`;
}

async function sendToTelegram(message) {
    isSending = true;
    sendButton.disabled = true;
    messageInput.disabled = true;
    sendButton.style.opacity = '0.7';
    
    // Add button press animation
    sendButton.style.transform = 'scale(0.95)';
    
    try {
        const timestampedMessage = formatTimestamp() + message;
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: timestampedMessage
            })
        });
        
        if (response.ok) {
            messageCount++;
            localStorage.setItem('message_count', messageCount);
            messageInput.value = ''; // Clear only after successful send
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error:', error);
        return false;
    } finally {
        setTimeout(() => {
            sendButton.style.transform = 'scale(1)';
            sendButton.disabled = false;
            messageInput.disabled = false;
            sendButton.style.opacity = '1';
            isSending = false;
            messageInput.focus();
        }, 1000);
    }
}

sendButton.addEventListener('click', async function(e) {
    const message = messageInput.value.trim();
    
    if (message === '') {
        e.preventDefault();
        const randomX = (Math.random() * 60 - 30);
        const randomY = (Math.random() * 60 - 30);
        sendButton.style.left = (originalLeft + randomX) + 'px';
        sendButton.style.top = (originalTop + randomY) + 'px';
    } else if (!isSending) {
        e.preventDefault();
        await sendToTelegram(message);
    }
});

// Retry failed messages on page load
window.addEventListener('load', () => {
    const failedMessages = JSON.parse(localStorage.getItem('failed_messages') || [];
    if (failedMessages.length > 0) {
        failedMessages.forEach(msg => {
            sendToTelegram(msg);
        });
        localStorage.removeItem('failed_messages');
    }
});
