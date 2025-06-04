document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const gameDateInput = document.getElementById('game-date');
    const gameLinkOutput = document.getElementById('game-link');
    const imageUploadForm = document.getElementById('image-upload-form');
    const uploadStatus = document.getElementById('upload-status');

    // Generate game link functionality
    generateBtn.addEventListener('click', () => {
        const gameDate = gameDateInput.value.trim();
        const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;

        if (!datePattern.test(gameDate)) {
            gameLinkOutput.textContent = 'Please enter a valid date in DD/MM/YY format (e.g., 04/06/25)';
            gameLinkOutput.style.color = 'red';
            return;
        }

        const gameLink = `${window.location.origin}?gameId=${gameDate}`;
        gameLinkOutput.innerHTML = `Game Link: <a href="${gameLink}" target="_blank">${gameLink}</a>`;
        gameLinkOutput.style.color = '#28a745';
    });

    // Image upload functionality
    imageUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadStatus.textContent = 'Uploading images...';
        uploadStatus.style.color = '#28a745';

        const formData = new FormData();
        const files = imageUploadForm.querySelectorAll('input[type="file"]');
        let hasFiles = false;

        files.forEach(fileInput => {
            if (fileInput.files.length > 0) {
                formData.append(fileInput.name, fileInput.files[0]);
                hasFiles = true;
            }
        });

        if (!hasFiles) {
            uploadStatus.textContent = 'Please select at least one image to upload.';
            uploadStatus.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/upload-images', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                uploadStatus.textContent = result;
                uploadStatus.style.color = '#28a745';
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            uploadStatus.textContent = 'Failed to upload images. Please try again.';
            uploadStatus.style.color = 'red';
        }
    });
});