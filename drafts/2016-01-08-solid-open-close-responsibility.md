---
title: 'Open Closed Principle'
date: "2016-01-08"
draft: false

---

This pattern says (classes or modules) should be open for extension, but closed for modification. 

Once we have written the class and tested it, it should not be modified again and again but it should be open for extension.

`ReportService.java`

### Example

```java
public class ReportService {

    public void generateReportBasedOnType(String type) {

        if ("CSV".equalsIgnoreCase(type)) {
            generateCSVReport();
        } 
        else if ("XML".equalsIgnoreCase(type)) {
            generateXMLReport();
        }
    }

    private void generateCSVReport() {
        System.out.println("Generate CSV Report");
    }

    private void generateXMLReport() {
        System.out.println("Generate XML Report");
    }
}
```

`Main.java`

```java
public class Main {

    public static void main(String[] args) {

        ReportService reportService = new ReportService();

        reportService.generateReportBasedOnType("CSV");

        reportService.generateReportBasedOnType("XML");

    }
}
```

This implementation is working fine, but let's suppose a new requirement pops up and you have to create one more report type i.e. Excel. 

You'd have to change the same class you already have tested. Vide `1C, 2C`. Also If you're using `Enums` for types, you have to change two classes.

Changing multiple classes/methods increases the chances to introduce bugs, creating a much hard maintenance and makes hard to test the whole application.

`ReportService.java`

```java
public class ReportService {

    public void generateReportBasedOnType(String type) {

        if ("CSV".equalsIgnoreCase(type)) {
            generateCSVReport();
        } 
        else if ("XML".equalsIgnoreCase(type)) {
            generateXMLReport();
        }
        // 1C
        else if("Excel".equalsIgnoreCase(reportingType.toString()))
        {
            generateExcelReport();
        }
    }

    private void generateCSVReport() {
        System.out.println("Generate CSV Report");
    }

    private void generateXMLReport() {
        System.out.println("Generate XML Report");
    }

    // 2C
    private void generateExcelReport() {
        System.out.println("Generate Excel Report");
    }
}
```

Based on the `Open Closed Principle` we could use a design pattern called `Strategy` to implement features that should be open for extension, but closed for modification.

### Example

`ReportStrategy`

```java
public interface ReportStrategy {

    void generateReport();
}
```

`ReportService.java`

```java
public class ReportService {

    public void generateReportBasedOnType(ReportStrategy type) {
        type.generateReport();
    }

}

```

`XmlGenerator.java`

```java

public class XmlGenerator implements ReportStrategy {

    @Override
    public void generateReport() {
        System.out.println("Generate XML Report");
    }
}
```

`CSVGenerator.java`

```java

public class CSVGenerator implements ReportStrategy {

    @Override
    public void generateReport() {
        System.out.println("Generate CSV Report");
    }
}

```

`Main.java`

```java
public class Main {

    public static void main(String[] args) {

        ReportService reportService = new ReportService();

        ReportStrategy csv = new CSVGenerator();

        reportService.generateReportBasedOnType(csv);

        ReportStrategy xml = new XmlGenerator();

        reportService.generateReportBasedOnType(xml);

    }
}
```

As you can see, no changes are necessary on `report service` once it was tested, also, we have two separated classes for different report types which
encopass the `Single Responsibility` as well as facilitate our tests keeping them  decoupled.
