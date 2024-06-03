---
title:  'Simple Web Server'
date: 2022-05-22T19:18:41-03:00
draft: false
---

```java
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;

import com.sun.net.httpserver.SimpleFileServer;
import com.sun.net.httpserver.SimpleFileServer.OutputLevel;

public class InMemoryFileServer {
    private static final InetSocketAddress LOOPBACK_ADDR = new InetSocketAddress(InetAddress.getLoopbackAddress(), 8080);
    public static final String JSON_FILE_NAME = "orders.json";
    public static final String DIR_PATH = System.getProperty("user.dir");

    public static void main( String[] args ) throws Exception {
        Path root = createDirectoryHierarchy();
        var server = SimpleFileServer.createFileServer(LOOPBACK_ADDR,  root, OutputLevel.VERBOSE);
        server.start();
        System.out.printf("http://%s:%d%n", server.getAddress().getHostString(), server.getAddress().getPort());
    }

    private static Path createDirectoryHierarchy() throws IOException {        
        Path dir = Files.createDirectories(Path.of(DIR_PATH));             
        return dir;
    }
}
```
