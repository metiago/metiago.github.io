import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class Server {

    public static void main(String[] args) throws IOException {
        Server server = new Server();
        server.run();
    }

    private void run() throws IOException {
        // Create an HTTP server that listens on port 8000
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        // Create a context for the root path ("/")
        server.createContext("/", new MyHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server started on port 8000");
    }

    class MyHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            var method = exchange.getRequestMethod();

            switch (method) {
                case "POST":
                    handlePost(exchange);
                    break;
                case "GET":
                    findOne(exchange);
                    break;
                default:
                    break;
            }
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    private void handlePost(HttpExchange exchange) throws IOException {
        // read payload from the request body
        String jsonPayload = readRequestBody(exchange);        
        System.out.println("client data: " + jsonPayload);
        
        // server response
        var resp = """
        {"message": "OK"}
        """;        
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(201, resp.length());
        OutputStream os = exchange.getResponseBody();
        os.write(resp.getBytes());
        os.close();
    }

    private void handleGet(HttpExchange exchange) throws IOException {
        String response = "{\"message\": \"Hello\"}";
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, response.length());
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private void findOne(HttpExchange exchange) throws IOException {

        String requestURI = exchange.getRequestURI().toString();

        String name = extractNameFromPath(requestURI);

        String response;
        if (name != null) {
            response = name;
        } else {
            response = String.format("User %s not found.", name);
        }

        exchange.getResponseHeaders().set("Content-Type", "text/plain");
        exchange.sendResponseHeaders(200, response.length());

        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private String extractNameFromPath(String path) {
        String[] parts = path.split("/");
        if (parts.length > 2) {
            return parts[2];
        }
        return null;
    }
}