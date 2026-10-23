FROM python:3.12-slim
WORKDIR /app
COPY receiver.py .
ENV PORT=9000
EXPOSE 9000
CMD ["python", "-u", "receiver.py"]
