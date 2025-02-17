# 🎨 Pixel Art Editor - 后端（FastAPI）

![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

本项目是 **像素画编辑器** 的 **后端 API**，基于 `FastAPI` + `PostgreSQL`，支持 **用户管理、作品存储、协作功能**。

🚀 **前端仓库**：👉 [前端代码链接](https://github.com/abaabaATU/pixelart-frontend)

---

## **📌 1. 技术栈**
- **后端框架**：FastAPI  
- **数据库**：PostgreSQL（云数据库 or 本地）  
- **ORM**：SQLAlchemy + Alembic  
- **身份认证**：OAuth2 + JWT  
- **对象存储（可选）**：AWS S3 / Azure Blob  

---

## **📌 2. 本地运行**
### **1️⃣ 克隆项目**
```sh
git clone https://github.com/Joey111a1/sse_team_project.git
cd sse_team_project/backend

### **2️⃣ 创建虚拟环境**
```sh
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate  # Windows
📌 确保激活了虚拟环境，否则 Python 可能使用的是全局环境

3️⃣ 安装依赖
pip install -r requirements.txt
📌 requirements.txt 已包含 FastAPI、SQLAlchemy、Alembic 等后端所需的所有依赖。

4️⃣ 配置环境变量
在 backend/ 目录下创建 .env 文件：
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pixelart
SECRET_KEY=your_secret_key
ALGORITHM=HS256
📌 DATABASE_URL 需要根据你的 PostgreSQL 配置进行调整。

5️⃣ 运行数据库迁移
alembic upgrade head
📌 如果没有 Alembic 迁移记录，先运行：
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

6️⃣ 启动 FastAPI
uvicorn app.main:app --reload
📌 默认运行在 http://127.0.0.1:8000
