# Builder AI

### AI-Powered React Website Builder

Builder AI is a React and Express application for generating, editing, previewing, and publishing websites from natural-language prompts.

Create engaging videos for products, brands, social media, and marketing campaigns — without complicated video-editing software.

---

## ✨ Features

* 🤖 AI-powered website generation
* 📝 Prompt-based project creation
* 🧩 Progressive file generation with live status
* 🖥️ Sandpack-powered previews
* ✏️ In-browser file editing and autosave
* 🌐 Public project publishing
* ⚡ Fast and responsive interface
* 📂 Generation history
* 👤 User authentication
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
* Supabase (PostgreSQL)
* JWT Authentication
* bcrypt
* dotenv
* CORS

### AI

* OpenRouter-compatible AI models
* Structured file planning and code generation

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
PORT=3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
AI_MAX_CONCURRENCY=6

ORIGINS=http://localhost:5173
```

Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor before starting the server. The backend uses the service role key only on the server; never expose it in the client.

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

## 🧱 Website Generation Flow

```text
User
  │
  ▼
Enter Prompt
  │
  ▼
Plan Project Files
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
Generate React Files
  │
  ▼
Preview and Edit
  │
  ▼
Publish Project
  │
  ▼
User Shares Public URL
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
