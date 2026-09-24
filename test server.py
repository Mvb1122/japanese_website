import mimetypes
import os
import socket
from urllib.parse import urlparse, parse_qs

HOST = "127.0.0.1"
PORT = 8080

def get_content_type(file_path):
    if file_path.lower().endswith(".mjs"):
        return "text/javascript; charset=utf-8"

    guessed_type, _ = mimetypes.guess_type(file_path)
    if guessed_type:
        return guessed_type

    return "application/octet-stream"

def http_response(status_code, body, content_type="text/plain; charset=utf-8"):
    reasons = {
        200: "OK",
        400: "Bad Request",
        404: "Not Found",
        405: "Method Not Allowed"
    }

    reason = reasons.get(status_code, "OK")

    response = (
        f"HTTP/1.1 {status_code} {reason}\r\n"
        f"Content-Type: {content_type}\r\n"
        f"Content-Length: {len(body)}\r\n"
        f"Connection: close\r\n"
        f"\r\n"
    )

    return response.encode("utf-8") + body

def handle_request(request_bytes):
    try:
        request_text = request_bytes.decode("iso-8859-1")
        lines = request_text.split("\r\n")

        request_line = lines[0]
        method, target, _ = request_line.split()

        if method != "GET":
            return http_response(405, b"Only GET supported")

        parsed = urlparse(target)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/":
            # Serve local index.html if present
            base = os.path.dirname(__file__)
            index_path = os.path.join(base, "index.html")
            try:
                with open(index_path, "rb") as f:
                    body = f.read()
                return http_response(200, body, get_content_type(index_path))
            except FileNotFoundError:
                return http_response(404, b"index.html not found")

        else:
            # Try to serve the file specified by the path
            base = os.path.dirname(__file__)
            file_path = os.path.join(base, path.lstrip("/"))
            try:
                with open(file_path, "rb") as f:
                    body = f.read()
                return http_response(200, body, get_content_type(file_path))
            except FileNotFoundError:
                return http_response(404, b"Page not found")

    except Exception:
        return http_response(400, b"Bad request")

def serve():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((HOST, PORT))
        server.listen(5)

        print(f"Listening on http://{HOST}:{PORT}")

        while True:
            client, _ = server.accept()
            with client:
                request = client.recv(4096)
                response = handle_request(request)
                client.sendall(response)

if __name__ == "__main__":
    serve()