document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input');
    const resizeBtn = document.getElementById('resize-btn');
    const sizeInput = document.getElementById('size-input');
    const loader = document.getElementById('loader');
    const output = document.getElementById('output');
    const uploadedPhotos = document.getElementById('uploaded-photos');
    const downloadLinks = document.getElementById('download-links');
    const downloadAllBtn = document.getElementById('download-all-btn');

    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    uploadBox.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadBox.classList.remove('dragover');
        fileInput.files = event.dataTransfer.files;
        displayUploadedPhotos(event.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
        displayUploadedPhotos(fileInput.files);
    });

    resizeBtn.addEventListener('click', async () => {
        const files = fileInput.files;
        const targetSize = parseInt(sizeInput.value);

        if (files.length === 0 || isNaN(targetSize) || targetSize <= 0) {
            alert('Please select files and enter a valid target size.');
            return;
        }

        loader.classList.remove('hidden');
        output.classList.add('hidden');
        downloadLinks.innerHTML = '';

        const resizedFiles = [];
        for (let file of files) {
            const resizedFile = await resizeImage(file, targetSize);
            resizedFiles.push(resizedFile);

            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(resizedFile);
            downloadLink.download = `resized-${file.name}`;
            downloadLink.textContent = `Download resized ${file.name}`;
            downloadLinks.appendChild(downloadLink);
        }

        if (resizedFiles.length > 1) {
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.onclick = () => downloadAll(resizedFiles);
        } else {
            downloadAllBtn.classList.add('hidden');
        }

        loader.classList.add('hidden');
        output.classList.remove('hidden');
    });

    function displayUploadedPhotos(files) {
        uploadedPhotos.innerHTML = '';
        for (let file of files) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            uploadedPhotos.appendChild(img);
        }
    }

    async function resizeImage(file, targetSizeKB) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    let quality = 0.9;
                    let resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    while (resizedDataUrl.length / 1024 > targetSizeKB && quality > 0.1) {
                        quality -= 0.05;
                        resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    fetch(resizedDataUrl)
                        .then(res => res.blob())
                        .then(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })))
                        .catch(reject);
                };
            };
            reader.onerror = reject;
        });
    }

    function downloadAll(files) {
        files.forEach(file => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});