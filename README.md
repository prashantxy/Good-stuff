# 🚐 FetiiAI – Smart Rideshare Insights

FetiiAI is an **interactive GPT-powered chatbot** that answers real-world questions based on **Fetii’s rideshare data** in Austin, TX.

Think: *ChatGPT, but it knows everything about Fetii group movement trends in Austin.*

With FetiiAI, you can ask questions like:
- “How many groups went to Moody Center last month?”
- “What are the top drop-off spots for 18–24 year-olds on Saturday nights?”
- “When do large groups (6+ riders) typically ride downtown?”

---

## ⚛️ Features
- **Interactive chatbot** powered by GPT that understands Fetii’s rideshare data.  
- **Real-time data querying** with PostgreSQL + Prisma.  
- **Clean and modern frontend** using Next.js.  
- **Secure backend API** built with Express.js & TypeScript.  
- **Seamless deployment** → Backend hosted on **Render**, frontend hosted on **Vercel** with proxy support.  

---

## 🛠 Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/) (React-based framework, deployed on Vercel)  
- **Backend**: [Express.js](https://expressjs.com/) with [Node.js](https://nodejs.org/) (deployed on Render)  
- **Database**: [PostgreSQL](https://www.postgresql.org/)  
- **ORM**: [Prisma](https://www.prisma.io/)  
- **Language**: [TypeScript](https://www.typescriptlang.org/)  
- **Deployment**: [Render](https://render.com/) (backend) + [Vercel](https://vercel.com/) (frontend)  
- **Package Manager**: [pnpm](https://pnpm.io/)  

---

## 📂 Dataset
The project uses Fetii’s Austin, TX rideshare dataset (`FetiiAI_Data_Austin.xlsx`) containing:
- **Trip Data**: Trip ID, booker’s User ID, pickup/drop-off coordinates & addresses, timestamps, group size.  
- **Rider Data**: Trip ID linked to riders (User IDs).  
- **Ride Demo**: User demographics (age).  

---

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/fetii-ai.git
cd fetii-ai
