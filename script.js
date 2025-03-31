const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const buttonContainer = document.querySelector('.button-container');

// Store original position
const originalLeft = 0;
const originalTop = 0;

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

sendButton.addEventListener('click', function(e) {
    if (messageInput.value.trim() === '') {
        e.preventDefault();
        
        // Calculate small random movement (max 30px in any direction)
        const randomX = (Math.random() * 60 - 30); // -30 to +30
        const randomY = (Math.random() * 60 - 30); // -30 to +30
        
        // Move button slightly from original position
        sendButton.style.left = (originalLeft + randomX) + 'px';
        sendButton.style.top = (originalTop + randomY) + 'px';
    }
});
