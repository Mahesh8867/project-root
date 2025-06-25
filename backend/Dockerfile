FROM python:3.10-slim
WORKDIR /app
# Install dependencies first (optimizes layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of the backend files
COPY . .
# Example command (adjust for Django/Flask/etc.)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]