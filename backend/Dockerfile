# Example backend Dockerfile for Django + Gunicorn

FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ✅ Install gunicorn explicitly
RUN pip install gunicorn

# Copy project code
COPY . .

# Run migrations (optional)
# CMD ["python", "manage.py", "migrate"]

# Start Gunicorn (you can override this in docker-compose if needed)
CMD ["gunicorn", "ecommerce.wsgi:application", "--bind", "0.0.0.0:8000"]
