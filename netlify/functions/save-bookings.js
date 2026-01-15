<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOOKS | AI Virtual Try-On</title>
    <style>
        :root {
            --accent: #e63946;
            --bg: #0b0b0b;
            --card: #161616;
            --text: #ffffff;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 500px;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        header {
            text-align: center;
            padding: 40px 0 30px;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin: 0;
        }

        .logo-line {
            width: 40px;
            height: 3px;
            background-color: var(--accent);
            margin: 10px auto 0;
        }

        #try-on-container {
            width: 100%;
            aspect-ratio: 1 / 1;
            background: var(--card);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #222;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        #try-on-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .action-btn {
            width: 100%;
            padding: 20px;
            background-color: var(--accent);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.1rem;
            font-weight: 800;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: transform 0.1s ease;
        }

        .action-btn:active {
            transform: scale(0.98);
        }

        #loading-text {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="logo">LOOKS</div>
        <div class="logo-line"></div>
    </header>

    <div id="try-on-container">
        <img id="output-image" src="placeholder-image.jpg" alt="AI Hairstyle Preview">
    </div>

    <button id="generate-btn" class="action-btn">Generate New Look</button>
</div>

<script>
    // This is where your Nano Banana / GenAI logic lived
    const generateBtn = document.getElementById('generate-btn');
    const outputImage = document.getElementById('output-image');

    generateBtn.addEventListener('click', async () => {
        generateBtn.innerText = "Processing...";
        
        // This is a placeholder for your working AI function
        // which triggers the Nano Banana model
        console.log("Generating look...");
        
        // After AI completes:
        // outputImage.src = resultURL;
        // generateBtn.innerText = "Generate New Look";
    });
</script>

</body>
</html>
