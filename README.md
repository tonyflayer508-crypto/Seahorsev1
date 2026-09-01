# 🎬 ReelGen

### AI-Powered Video Generation Platform

ReelGen is a modern AI-powered web application for creating short-form marketing videos from simple prompts and product information.

Create engaging videos for products, brands, social media, and marketing campaigns — without complicated video-editing software.

---

## ✨ Features

* 🤖 AI-powered video generation
* 📝 Prompt-based video creation
* 🖼️ Product image upload
* 🎭 AI-generated scenes and visuals
* 📱 Multiple aspect ratios
* 🎬 Short-form social media videos
* ⚡ Fast and responsive interface
* 📂 Generation history
* 👤 User authentication
* 💜 Modern purple-themed UI
* 📱 Responsive design
* 🔐 Secure API integration

---

## 🖥️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* dotenv
* CORS

### AI

* Google AI Studio / Gemini API
* AI-powered video generation pipeline

---

## 📁 Project Structure

```text
ReelGen/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/reelgen.git
```

### 2. Enter the project

```bash
cd reelgen
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_ai_studio_api_key

CLIENT_URL=http://localhost:5173
```

⚠️ **Never commit your `.env` file to GitHub.**

Make sure your `.gitignore` contains:

```gitignore
node_modules/
.env
.env.local
dist/
build/
```

---

## ▶️ Run the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## 🎥 Video Generation Flow

```text
User
  │
  ▼
Enter Prompt
  │
  ▼
Upload Product Image
  │
  ▼
ReelGen Frontend
  │
  ▼
Backend API
  │
  ▼
AI Generation Pipeline
  │
  ▼
Generate Scenes
  │
  ▼
Generate Video
  │
  ▼
Store Generation
  │
  ▼
User Downloads / Shares Video
```

---

## 📐 Supported Formats

| Format    | Aspect Ratio | Use Case                |
| --------- | ------------ | ----------------------- |
| Portrait  | 9:16         | Reels / TikTok / Shorts |
| Landscape | 16:9         | YouTube / Websites      |
| Square    | 1:1          | Social Media Posts      |

---

## 🧠 AI Generation

ReelGen can transform a simple product description into a structured video concept.

Example:

```text
Create a cinematic advertisement for a premium black smartwatch.
Show the watch on a futuristic desk with dramatic lighting.
Use smooth camera movements and premium product shots.
```

The system can convert the prompt into:

```text
Prompt
   ↓
Scene Planning
   ↓
Visual Generation
   ↓
Motion / Video Generation
   ↓
Video Processing
   ↓
Final Reel
```

---

## 🎨 UI

ReelGen uses a modern SaaS interface focused on:

* Minimal design
* Purple gradient branding
* Glassmorphism elements
* Smooth animations
* Responsive layouts
* Simple creation workflow

---

## 🔒 Security

The application uses:

* JWT authentication
* Password hashing with bcrypt
* Environment variables for secrets
* Protected API routes
* CORS configuration
* Server-side API key protection

Never expose AI API keys in the React frontend.

---

## 🛣️ Roadmap

* [x] User authentication
* [x] Project creation
* [x] Product image upload
* [x] Prompt-based generation
* [x] Generation history
* [ ] Advanced video editing
* [ ] AI voice generation
* [ ] AI avatars
* [ ] Background music
* [ ] Automatic captions
* [ ] Brand kits
* [ ] Team collaboration
* [ ] Public templates
* [ ] Social media publishing
* [ ] Cloud video storage
* [ ] Credit-based billing

---

## 📸 Screenshots

Add screenshots of your application here:

```text
screenshots/
├── home.png
├── generator.png
├── generations.png
└── dashboard.png
```

Example:

```markdown
![ReelGen Home](screenshots/home.png)
```

---

## 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/my-feature
git add .
git commit -m "Add new feature"
git push origin feature/my-feature
```

Then create a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like ReelGen, consider giving the repository a ⭐ on GitHub.

**Built with ❤️ and AI.**

# ReelGen

> Create. Generate. Share.
