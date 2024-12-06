---
title: 'Fetch and Process API Data Go and Java'
date: "2024-02-08"
draft: false
image: "https://placehold.co/600x400"
---

Simple HTTP server written in Go that serves paginated articles from a JSON file (db.json). It defines a structure for the response and the article data, handles pagination, and returns the results in JSON format.

[db.json](/files/db.json)

```go
package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
)

type Response struct {
	Page       int    `json:"page"`
	PerPage    int    `json:"per_page"`
	Total      int    `json:"total"`
	TotalPages int    `json:"total_pages"`
	Data       []Data `json:"data"`
}

type Data struct {
	Title       *string `json:"title"` 
	URL         *string `json:"url"`
	Author      string  `json:"author"`
	NumComments *int    `json:"num_comments"`
	StoryID     *int    `json:"story_id"`  
	StoryTitle  *string `json:"story_title"`  
	StoryURL    *string `json:"story_url"` 
	ParentID    *int    `json:"parent_id"` 
	CreatedAt   int64   `json:"created_at"`
}

const ITEMS_PER_PAGE = 2

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

func getArticles(w http.ResponseWriter, r *http.Request) {

	pageParam := r.URL.Query().Get("page")
	var page int = 1
	var err error

	if pageParam != "" {
		page, err = strconv.Atoi(pageParam)
		if err != nil {
			http.Error(w, "Invalid page number", http.StatusBadRequest)
			return
		}
	}

	file, err := os.Open("db.json")
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	var data []Data
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusInternalServerError)
		return
	}

	resp := Response{Page: page,
		PerPage:    ITEMS_PER_PAGE,
		Total:      len(data) - 1,
		TotalPages: int(math.Round(float64(len(data)) / float64(ITEMS_PER_PAGE))),
		Data:       paginateArray(data, page, ITEMS_PER_PAGE)}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func paginateArray(arr []Data, pageNumber int, pageSize int) []Data {
	startIdx := (pageNumber - 1) * pageSize
	endIdx := startIdx + pageSize
	if startIdx < 0 || startIdx > len(arr) {
		return make([]Data, 0)
	} else if endIdx > len(arr) {
		return arr[startIdx:]
	} else {
		return arr[startIdx:endIdx]
	}
}

func main() {
	http.HandleFunc("/articles", getArticles)
	http.ListenAndServe(":8000", nil)
}
```

Here is the Java implementation that simply demonstrates how to fetch articles from the RESTful API above, paginate through the results, and then sort the articles based on the number of comments and their titles. Below is a breakdown of the key components of your code, along with some suggestions for improvement and clarification.

```java
public class Main {

  public static void main(String[] args) throws Exception {
    var topArticles = getTopArticles(2);
    System.out.println(topArticles);
  }

  public static List<String> getTopArticles(int limit) throws Exception {
    var articles = paginateArticleAPI();
    var dataItems = articles.stream().flatMap(fm -> fm.data().stream()).toList();
    return dataItems.stream()
        .filter(article -> article.numComments() > 0)
        .filter(article -> article.title() != null)
        .sorted(Comparator.comparingInt(Article::numComments).reversed().thenComparing(Article::title))
        .map(Article::title)
        .limit(limit)
        .toList();
  }

  public static List<ApiResponse> paginateArticleAPI() throws Exception {
    int currentPage = 1;
    int totalPage = 1;
    var data = new ArrayList<ApiResponse>();
    while (currentPage <= totalPage) {
      var resp = fetchArticles(currentPage);
      data.add(resp);
      totalPage = resp.totalPages();
      currentPage++;
    }
    return data;
  }

  public static ApiResponse fetchArticles(int pageNum) throws Exception {
    HttpResponse<String> res;
    try (HttpClient client = HttpClient.newHttpClient()) {
      var url = String.format("http://localhost:8000/articles?page=%s", pageNum);
      var req = HttpRequest.newBuilder().uri(URI.create(url)).build();
      res = client.send(req, HttpResponse.BodyHandlers.ofString());
    }
    return new ObjectMapper().readValue(res.body(), ApiResponse.class);
  }
}
```

```java
import com.fasterxml.jackson.annotation.JsonProperty;

public record Article(String title,
                      String url,
                      String author,
                      @JsonProperty("num_comments") int numComments,
                      @JsonProperty("story_id") Integer storyId,
                      @JsonProperty("story_title") String storyTitle,
                      @JsonProperty("story_url") String storyUrl,
                      @JsonProperty("parent_id") Integer parentId,
                      @JsonProperty("created_at") long createdAt) {
}
```

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ApiResponse(int page,
                          @JsonProperty("per_page") int perPage, int total,
                          @JsonProperty("total_pages") int totalPages,
                          List<Article> data) {
}
```