# Pallete-pull
A modern and lightweight image color palette extractor built using HTML, CSS, and  JavaScript. Upload any image and instantly generate its dominant color palette with one-click color copying and CSS variable export functionality.

Overview
Palette Pull is a browser-based application that analyzes uploaded images and extracts the most dominant colors present in them. The application performs all processing on the client side using the HTML Canvas API, ensuring fast performance and user privacy.

Features
Drag and drop image upload
Supports JPG, PNG, and WEBP formats
Dominant color extraction
Interactive color palette display
One-click HEX color copying
Export palette as CSS variables
Responsive user interface
No external libraries or frameworks required
Fast client-side image processing

Technologies Used
HTML5
CSS3
JavaScript 
Canvas API
Project Structure

Palette-Pull/
│
├── index.html
├── style.css
├── script.js
└── README.md

How It Works
Upload an image through drag-and-drop or file selection.
The image is rendered onto a hidden canvas.
Pixel data is sampled from the image.
Similar colors are grouped into buckets.
The most frequently occurring colors are identified.
A palette of dominant colors is displayed.
Users can copy individual HEX codes or export the entire palette as CSS variables.
Sample Output
:root {
  --color-1: #D29A4A;
  --color-2: #7A5C34;
  --color-3: #E7D1B0;
  --color-4: #4A3A24;
  --color-5: #A06B2B;
  --color-6: #F4E8D5;
}
Key Concepts Demonstrated

File handling in JavaScript
Canvas-based image processing
DOM manipulation
Color extraction algorithms
Clipboard API integration
Responsive web design
Future Enhancements
Download palette as an image
Automatic gradient generation
Color harmony recommendations
Theme customization
Palette history management
Export support for JSON and SCSS
Installation
Clone the repository:
git clone <repository-url>
Navigate to the project folder:
cd Palette-Pull
Open index.html in a web browser.

No additional dependencies or installation steps are required.

Responsive Design

The application is optimized for:
Desktop devices
Tablets
Mobile devices

Author
Mithika Biju
