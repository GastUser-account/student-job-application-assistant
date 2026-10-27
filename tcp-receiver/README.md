# GSX8 TCP receiver

This service accepts raw TCP connections and forwards each collected payload to a Supabase Edge Function over HTTPS.

## Environment variables
- `PORT`: TCP port (default 9000)
- `SUPABASE_FUNCTION_URL`: full URL of the deployed `logger-ingest` Edge Function
- `LOGGER_INGEST_SECRET`: same secret configured in the Edge Function
- `DEVICE_ID`: optional device label
- `IDLE_TIMEOUT_SECONDS`: seconds of inactivity used to decide a payload is complete (default 2)
- `MAX_PAYLOAD_BYTES`: maximum bytes per connection (default 65536)

## Deploying
Deploy this directory as a Docker service on a host that supports an inbound TCP port. Configure a public TCP proxy/port for container port 9000, then put that public hostname and port into the GSX8. An HTTPS URL alone is not a TCP endpoint.

## Important
This prototype assumes a payload ends when the connection closes or is idle for 2 seconds. Confirm the logger's protocol/framing and required response/acknowledgement bytes before using this in production. No acknowledgement is sent by default. Never commit secrets to Git.
