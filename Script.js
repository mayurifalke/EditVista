//script for sidebar
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
});
searchBtn.addEventListener("click", () => { // Sidebar open when you click on the search iocn
    sidebar.classList.toggle("open");
    menuBtnChange(); //calling the function(optional)
});
// following are the code to change sidebar button(optional)
function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");//replacing the iocns class
    }
}

//crop code
document.addEventListener('DOMContentLoaded', function () {
    const uploadInput = document.getElementById('upload');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const cropToggle = document.getElementById('crop-toggle');
    const cropToggleText = cropToggle.querySelector('.links_name');
    const resetToggle = document.getElementById('reset-toggle');
    let image = new Image();
    let originalImageData;
    let previousImageData;
    let cropping = false;
    let startX, startY, endX, endY;
    let isSelecting = false;
    let imageLoaded = false; // Flag to track if an image has been loaded

    // Load image onto the canvas
    uploadInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resetToggle.style.display = 'inline';
                    cropToggleText.textContent = 'Start Crop';
                    imageLoaded = true; // Set the flag to true when an image is loaded
                    cropToggle.classList.remove('active');
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Toggle cropping mode
    cropToggle.addEventListener('click', function (e) {
        e.preventDefault();  // Prevent default anchor behavior
        cropping = !cropping;
        cropToggleText.textContent = cropping ? 'Crop' : 'Start Crop';

        if (!cropping) {
            if (startX !== undefined && startY !== undefined && endX !== undefined && endY !== undefined) {
                const width = endX - startX;
                const height = endY - startY;
                previousImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save the current state before cropping
                const croppedImage = ctx.getImageData(startX, startY, width, height);
                canvas.width = width;
                canvas.height = height;
                ctx.putImageData(croppedImage, 0, 0);
                image.src = canvas.toDataURL();  // Update the image source to the cropped version
                startX = startY = endX = endY = undefined;  // Reset coordinates
            }
        } else {
            startX = startY = endX = endY = undefined;  // Reset coordinates for new selection
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);  // Redraw the image
        }
    });

    // Reset image to the previous state before the last crop
    resetToggle.addEventListener('click', function (e) {
        e.preventDefault();  // Prevent default anchor behavior
        if (previousImageData) {
            canvas.width = previousImageData.width;
            canvas.height = previousImageData.height;
            ctx.putImageData(previousImageData, 0, 0);
            image.src = canvas.toDataURL();  // Restore the image to the previous state
            cropToggleText.textContent = 'Start Crop';
            cropToggle.classList.remove('active');
            cropping = false;
            startX = startY = endX = endY = undefined;  // Reset coordinates
        }
    });

    // Handle mouse events for cropping
    canvas.addEventListener('mousedown', function (e) {
        if (!cropping) return;
        isSelecting = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', function (e) {
        if (!cropping || !isSelecting) return;
        const rect = canvas.getBoundingClientRect();
        endX = e.clientX - rect.left;
        endY = e.clientY - rect.top;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    });

    canvas.addEventListener('mouseup', function () {
        if (!cropping) return;
        isSelecting = false;
    });

    //code for save an image
    const saveLink = document.getElementById('saveLink');
    

      // Function to save the current state of the canvas as an image
      saveLink.addEventListener('click', function (e) {
        e.preventDefault();

        if (!imageLoaded) {
            // Show alert if no image is loaded
            alert('Please upload an image before downloading.');
            return;
        }

        else{
        // Get the data URL of the image on the canvas
        const dataURL = canvas.toDataURL('image/png');
        
        // Create a temporary link to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'edited-image.png';
        
        // Trigger the download by simulating a click event
        downloadLink.click();
        }
    });
});

//code for brightness
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const brightnessLink = document.getElementById('brightnessLink');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const resetToggle = document.getElementById('reset-toggle');
    const cropToggleText = document.getElementById('crop-toggle-text');
    const cropToggle = document.getElementById('crop-toggle');
    
    let originalImageData;
    let preFeatureImageData;
    let previousImageData; // For storing state before the last crop

    // Assuming the image is already drawn on the canvas
    // Capture the original image data
    function captureOriginalImageData() {
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Capture the image data before applying any feature adjustments
    function capturePreFeatureImageData() {
        preFeatureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Adjust brightness
    brightnessSlider.addEventListener('input', function () {
        adjustBrightness(parseInt(this.value));
    });

    function adjustBrightness(brightness) {
        if (!preFeatureImageData) return;
        
        const imageData = ctx.createImageData(preFeatureImageData);
        const data = preFeatureImageData.data;
        const newData = imageData.data;

        const factor = brightness / 100; // Normalize brightness value (0 to 2, with 1 being no change)

        for (let i = 0; i < data.length; i += 4) {
            newData[i] = data[i] * factor;     // Red
            newData[i + 1] = data[i + 1] * factor; // Green
            newData[i + 2] = data[i + 2] * factor; // Blue
            newData[i + 3] = data[i + 3];         // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save current state
    }

    // Show the brightness slider when the brightness link is clicked
    brightnessLink.addEventListener('click', function (e) {
        e.preventDefault();
        brightnessSlider.style.display = 'block';
        capturePreFeatureImageData(); // Capture the image data before applying brightness adjustments
    });

    // Reset the image to its state before any feature adjustments
    resetToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (preFeatureImageData) {
            ctx.putImageData(preFeatureImageData, 0, 0);
            brightnessSlider.value = 100; // Reset slider value to default
        }
    });

    // Initialize: capture the original image data after ensuring the image is loaded
    window.addEventListener('load', captureOriginalImageData);
});

//for Grayscale effect
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const grayscaleLink = document.getElementById('grayscaleLink');
    const resetToggle = document.getElementById('reset-toggle');
    const uploadInput = document.getElementById('upload');

    let image = new Image();
    let originalImageData;
    let currentImageData;

    // Load image onto the canvas
    uploadInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    captureOriginalImageData(); // Capture the original image data
                    resetToggle.style.display = 'inline';
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Capture the original image data
    function captureOriginalImageData() {
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        currentImageData = originalImageData;
    }

    // Apply grayscale effect
    grayscaleLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (!currentImageData) return;

        const imageData = ctx.createImageData(currentImageData);
        const data = currentImageData.data;
        const newData = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const avg = (r + g + b) / 3;
            newData[i] = avg;        // Red
            newData[i + 1] = avg;    // Green
            newData[i + 2] = avg;    // Blue
            newData[i + 3] = data[i + 3]; // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
    });

    // Reset the image to its original state
    resetToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
        }
    });

    // Initialize: capture the original image data after ensuring the image is loaded
    window.addEventListener('load', captureOriginalImageData);
});

//Blur effect
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const blurLink = document.getElementById('blurLink');
    const blurSlider = document.getElementById('blurSlider');
    const resetToggle = document.getElementById('reset-toggle');
    const uploadInput = document.getElementById('upload');

    let image = new Image();
    let originalImageData;
    let currentImageData;

    // Load image onto the canvas
    uploadInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    captureOriginalImageData(); // Capture the original image data
                    resetToggle.style.display = 'inline';
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Capture the original image data
    function captureOriginalImageData() {
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        currentImageData = originalImageData;
    }

    // Apply blur effect
    blurLink.addEventListener('click', function (e) {
        e.preventDefault();
        blurSlider.style.display = 'block'; // Show the slider
        captureOriginalImageData(); // Capture the image data before applying blur adjustments
    });

    blurSlider.addEventListener('input', function () {
        applyBlur(parseInt(this.value));
    });

    function applyBlur(blurValue) {
        ctx.putImageData(originalImageData, 0, 0); // Reset to original image data
        ctx.filter = `blur(${blurValue}px)`;
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none'; // Reset the filter
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Update the current image data
    }

    // Reset the image to its original state
    resetToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
            currentImageData = originalImageData; // Reset the current image data
            blurSlider.style.display = 'none'; // Hide the slider
            blurSlider.value = 0; // Reset slider value to default
        }
    });

    // Initialize: capture the original image data after ensuring the image is loaded
    window.addEventListener('load', function () {
        if (canvas.width > 0 && canvas.height > 0) {
            captureOriginalImageData();
        }
    });
});

//rotate code
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const rotateLink = document.getElementById('rotateLink');
    const flipHorizontalLink = document.getElementById('flipHorizontalLink');
    const flipVerticalLink = document.getElementById('flipVerticalLink');
    const effectSlider = document.getElementById('effectSlider');
    const resetToggle = document.getElementById('reset-toggle');
    const uploadInput = document.getElementById('upload');

    let image = new Image();
    let originalImageData;
    let currentImageData;

    // Load image onto the canvas
    uploadInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    captureOriginalImageData(); // Capture the original image data
                    resetToggle.style.display = 'inline';
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Capture the original image data
    function captureOriginalImageData() {
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        currentImageData = originalImageData;
    }

    // Show the slider for rotation and handle rotation
    rotateLink.addEventListener('click', function (e) {
        e.preventDefault();
        effectSlider.style.display = 'block'; // Show the slider
        effectSlider.min = 0;
        effectSlider.max = 360;
        effectSlider.value = 0;
        captureOriginalImageData(); // Capture the image data before applying rotation

        effectSlider.oninput = function () {
            const angle = parseInt(this.value);
            applyRotation(angle);
        };
    });

    function applyRotation(angle) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Update the current image data
    }

    // Flip the image horizontally
    flipHorizontalLink.addEventListener('click', function (e) {
        e.preventDefault();
        applyFlip('horizontal');
    });

    // Flip the image vertically
    flipVerticalLink.addEventListener('click', function (e) {
        e.preventDefault();
        applyFlip('vertical');
    });

    function applyFlip(direction) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (direction === 'horizontal') {
            ctx.scale(-1, 1);
            ctx.drawImage(image, -canvas.width, 0);
        } else if (direction === 'vertical') {
            ctx.scale(1, -1);
            ctx.drawImage(image, 0, -canvas.height);
        }
        ctx.restore();
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Update the current image data
    }

    // Reset the image to its original state
    resetToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
            currentImageData = originalImageData; // Reset the current image data
            effectSlider.style.display = 'none'; // Hide the slider
            effectSlider.value = 0; // Reset slider value to default
        }
    });

    // Initialize: capture the original image data after ensuring the image is loaded
    window.addEventListener('load', function () {
        if (canvas.width > 0 && canvas.height > 0) {
            captureOriginalImageData();
        }
    });
});

//for save the image
// document.addEventListener('DOMContentLoaded', function () {
//     const canvas = document.getElementById('canvas');
//     const ctx = canvas.getContext('2d');
//     const saveLink = document.getElementById('saveLink');
//     const uploadInput = document.getElementById('upload');
    
//     let imageLoaded = false; // Flag to track if an image has been loaded

//     // Function to save the current state of the canvas as an image
//     saveLink.addEventListener('click', function (e) {
//         e.preventDefault();

//         if (!imageLoaded) {
//             // Show alert if no image is loaded
//             alert('Please upload an image before download');
//             return;
//         }
//         else{
//         // Get the data URL of the image on the canvas
//         const dataURL = canvas.toDataURL('image/png');
        
//         // Create a temporary link to trigger the download
//         const downloadLink = document.createElement('a');
//         downloadLink.href = dataURL;
//         downloadLink.download = 'edited-image.png';
        
//         // Trigger the download by simulating a click event
//         downloadLink.click();
//         }
//     });
// });

