# SmartPlate AI 🍽️✨

**The Last Diet App You'll Ever Need.**  
AI-Powered, IoT-Enabled Nutritional Intelligence & Metabolic Optimization.

![SmartPlate AI Preview](smartplate/landing/public/ai_coach_visual_landing_1777056498771.png)

---

## 🚀 Overview

**SmartPlate AI** is a premium, full-stack health ecosystem designed to decode your body's blueprint. It combines the power of **Google Gemini AI**, **Clinical-Grade Nutrition Data**, and **Premium UI/UX** to provide a personalized health journey that evolves with you.

From instant calorie vision (analyzing meals from photos) to dynamic metabolic protocols, SmartPlate transforms complex biometric data into actionable daily habits.

---

## ✨ Key Features

### 🧠 1. AI Nutrition Coach
- **Personalized Advice**: Integrated with **Google Gemini AI** to provide real-time coaching based on your specific health goals, dietary preferences, and metabolic rate.
- **Context-Aware**: The coach knows your meal history, weight trends, and activity levels.

### 📸 2. Smart Meal Tracking (Vision & Log)
- **Calorie Vision**: Log meals instantly via image uploads (powered by **Cloudinary**) or text descriptions.
- **Detailed Macros**: Automatically calculates Calories, Protein, Carbs, Fats, Fiber, and Sodium using the **Edamam API**.
- **Historical Analysis**: Track your adherence with daily and weekly heatmaps.

### 📈 3. Dynamic Health Protocols
- **Custom Plans**: Specialized protocols for Weight Loss, Muscle Gain, Keto, Vegan, and Therapeutic nutrition (Diabetes, PCOS, etc.).
- **Real-Time Adaptation**: Plans adjust automatically as your weight and metabolic markers change.

### 🏆 4. Gamified Adherence
- **Points & Awards**: Earn points for staying on track. Unlock awards like "Consistency King" or "Monthly Milestone".
- **Cheat Day Logic**: Intelligent "Cheat Day" unlocks based on your streak and adherence score.

### 🛡️ 5. Social Tribes
- **Community Groups**: Join specialized "Tribes" to share progress, recipes, and stay motivated with like-minded individuals.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Logic**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/), [Framer Motion](https://www.framer.com/motion/), [Lenis Scroll](https://lenis.darkroom.engineering/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)

### AI & APIs
- **Intelligence**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Nutrition Data**: [Edamam API](https://www.edamam.com/)
- **Media Hosting**: [Cloudinary](https://cloudinary.com/)

---

## 🏗️ Project Structure

```bash
SmartPlate/
├── smartplate/
│   ├── landing/       # Next.js Frontend (Premium UI)
│   └── server/        # Node.js Backend (Core Logic & DB)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Supabase recommended)
- API Keys: Google Gemini, Cloudinary, Edamam.

### 1. Backend Setup
```bash
cd smartplate/server
npm install
```

Create a `.env` file in `smartplate/server`:
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=5051

# APIs
EDAMAM_APP_ID=your_id
EDAMAM_APP_KEY=your_key
GEMINI_API_KEY=your_gemini_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

Run database migrations:
```bash
npm run db:push
npm run dev        # Start server on port 5051
```

### 2. Frontend Setup
```bash
cd smartplate/landing
npm install
npm run dev        # Start frontend on port 3000
```

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Developed with ❤️ by [Akash](https://github.com/Akash04471)**
