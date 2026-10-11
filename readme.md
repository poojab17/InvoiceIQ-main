# 🚀 InvoiceIQ

<h3 align="center">
AI-Powered Intelligent Invoice Processing System
</h3>

<p align="center">
Automatically extract structured invoice information using <b>OCR + LayoutLM</b>, manage invoices through a modern dashboard, and streamline document processing with AI.
</p>

<p align="center">
<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/AI-LayoutLM-blueviolet"/>
<img src="https://img.shields.io/badge/License-MIT-yellow"/>
</p>

---

# 📖 Overview

InvoiceIQ is an end-to-end AI-powered invoice processing application that transforms unstructured invoice images into structured digital records.

The project combines **Tesseract OCR**, **LayoutLM**, **FastAPI**, **Express.js**, **MongoDB**, and **React** to automate invoice understanding and reduce manual processing.

Instead of manually reading invoices, users simply upload an invoice image and InvoiceIQ extracts important business information such as vendor details, invoice date, invoice number, and total amount.

---

# ✨ Key Highlights

- 🤖 AI-powered Invoice Information Extraction
- 📄 OCR + LayoutLM Pipeline
- 🔐 JWT Authentication
- 📊 Analytics Dashboard
- 📂 Invoice Management
- 🔍 Search, Filter & Pagination
- ⚡ FastAPI + Express Integration
- 🗄 MongoDB Storage
- 📱 Responsive User Interface

---

# 🤖 AI Pipeline

```text
Invoice Image
      │
      ▼
Tesseract OCR
      │
      ▼
LayoutLM
      │
      ▼
Rule-Based Validation
      │
      ▼
FastAPI AI Service
      │
      ▼
Express.js Backend
      │
      ▼
MongoDB
      │
      ▼
React Dashboard
```

### LayoutLM extracts:

- Company Name
- Invoice Date
- Address
- Total Amount

---

# 🏗️ System Architecture

```text
                User
                  │
                  ▼
         React Frontend
                  │
            REST APIs
                  ▼
        Express.js Backend
          │            │
          ▼            ▼
     MongoDB      FastAPI AI
                      │
                      ▼
              OCR + LayoutLM
```

---

# 📸 Screenshots

## 🔐 Authentication

### Login

<img src="https://github.com/user-attachments/assets/81ad41e8-0ff7-4ce5-ad57-d8f350fa9574"/>

---

## 📊 Dashboard

<img src="https://github.com/user-attachments/assets/ddbf8e09-9b6c-4423-9e52-7aee39842441"/>

<img src="https://github.com/user-attachments/assets/0ea489ce-918b-42de-8776-3f7f57e9b03b"/>

<img src="https://github.com/user-attachments/assets/c5f244d7-804a-4f90-8f79-8558e3f10019"/>

<img src="https://github.com/user-attachments/assets/c84cda85-a10e-4b3f-86f3-0bc8ce96d47c"/>

---

## 📤 Invoice Upload

<img src="https://github.com/user-attachments/assets/eedf824d-4786-4fc7-8712-1dcce4a7a02e"/>

---

## 📄 Invoice Management

<img src="https://github.com/user-attachments/assets/2227fe77-6d67-4f42-b7e1-4b5cbc3b9bf4"/>

<img src="https://github.com/user-attachments/assets/bfabe002-6688-4934-aef3-4ceab1a7f4d7"/>

---

## 📈 Analytics

<img src="https://github.com/user-attachments/assets/d37e95d8-593f-4d6d-821e-5453bd6033af"/>

<img src="https://github.com/user-attachments/assets/1fe0ce45-b666-4f88-90ff-934169c7d866"/>

<img src="https://github.com/user-attachments/assets/1d8284f8-a652-4640-88ef-565fe4654028"/>

---

## 🧠 AI Insights

<img src="https://github.com/user-attachments/assets/9c14fbcd-30b5-4d92-8413-68a428409962"/>

<img src="https://github.com/user-attachments/assets/cd521864-0def-433f-934a-ee7e890a1e7a"/>

<img src="https://github.com/user-attachments/assets/a4d2a3c0-2197-4772-8413-9cd9dadf9156"/>

---

# ⚙️ Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI Service | Python, FastAPI |
| Machine Learning | LayoutLM (Hugging Face) |
| OCR | Tesseract OCR |
| Database | MongoDB |
| Authentication | JWT |

---

# 📂 Project Structure

```text
InvoiceIQ
│
├── Frontend/          # React Application
├── Backend/           # Express REST APIs
├── AI-Service/        # FastAPI + LayoutLM
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/100rabheimer/InvoiceIQ.git
cd InvoiceIQ
```

---

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs at

```
http://localhost:5173
```

---

## Backend

```bash
cd Backend
npm install
npm start
```

Runs at

```
http://localhost:5000
```

---

## AI Service

```bash
cd AI-Service

pip install -r requirements.txt

uvicorn main:app --reload
```

Runs at

```
 http://127.0.0.1:8000 
```


# 📡 REST APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register User |
| POST | `/login` | Login User |
| POST | `/api/invoices/process` | Upload Invoice |
| GET | `/api/invoices` | Get All Invoices |
| GET | `/api/invoices/:id` | Get Invoice Details |
| PATCH | `/api/invoices/:id` | Update Invoice |
| DELETE | `/api/invoices/:id` | Delete Invoice |

---

# 📚 Dataset

The AI model is trained using the **SROIE (Scanned Receipts OCR and Information Extraction)** dataset.

The dataset contains annotated invoice entities including:

- Company
- Address
- Invoice Date
- Total Amount

---

# 🚀 Future Improvements

- ☁️ AWS Cloud Deployment
- 📄 PDF Invoice Support
- 🌍 Multilingual Invoice Processing
- 🧠 LLM-based Document Understanding
- 📱 Mobile Application

---

# 👨‍💻 Author

## Saurabh Pandey

B.Tech 
Information Technology

Backend • AI/ML • Cloud Enthusiast

GitHub:
https://github.com/100rabheimer

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
---
