# Jipiey - AI-Powered GPA Calculator

Jipiey is an intelligent GPA calculator that uses AI to analyze and process grade tables from uploaded images. Simply upload an image of your grades in tabular format, and our AI will automatically calculate your GPA and generate a structured table from the image.

## Features

- 📸 Image Upload: Upload images containing grade tables
- 🤖 AI Analysis: Automatic extraction and processing of grade data
- 📊 GPA Calculation: Accurate GPA computation based on extracted grades
- 📋 Table Generation: Clean, formatted table output of your grades
- 🧠 Gemini AI Integration: Get personalized insights and recommendations based on your grades

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

### Setting up Gemini API

The application uses Google's Gemini AI for grade analysis. To set up the Gemini API:

1. Visit [Google AI Studio](https://ai.google.dev/) to get your Gemini API key
2. Create a `.env.local` file in the root of the project
3. Add your API key to the file:
   ```env
   # Use GEMINI_API_KEY (not prefixed with NEXT_PUBLIC) to keep it server-side only
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   ⚠️ Note: Never use NEXT_PUBLIC_ prefix for API keys as it exposes them to the client

Then, run the development server:

```bash
pnpm dev
```

To access the app from other devices on the same network (e.g., your phone), use:

```bash
pnpm dev:network
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- [Next.js](https://nextjs.org) - React framework for production
- [pnpm](https://pnpm.io) - Fast, disk space efficient package manager
- [Google Gemini AI](https://ai.google.dev/) - AI for analysis and recommendations
- AI/ML technologies for image processing and data extraction

## Development

The main application code is located in the `app` directory. The page auto-updates as you edit the files.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## Deployment

This application can be deployed on [Vercel](https://vercel.com) for optimal performance and easy setup.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
