+++

title =  'Date & Datetime'
date = 1500-05-19T19:18:41-03:00

draft = false

+++

Java Date & Datetime API samples.

Get day of week for a given year.

```java
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;

public class DateMain {

    public static void main(String[] args) {

        // SINGLE LINE
        String year = "2022-01-01";
        // WILL FAIL IF YEAR IS NULL OR EMPTY
        DateTimeFormatter.ofPattern("MMM dd y").format(LocalDate.parse(year));

        // USING GregorianCalendar API
        System.out.println(findDay(1, 1, 1985));
    }

    public static String findDay(int month, int day, int year) {

        TimeZone timezone = TimeZone.getDefault();
        Calendar calendar = new GregorianCalendar(timezone);
        calendar.set(year, month - 1, day); // MONTH STARTS WITH ZERO
        SimpleDateFormat f = new SimpleDateFormat("EEEE");
        return f.format(calendar.getTime()).toUpperCase();
    }
}
```

How to convert date format output.

```java
class Result {

    // Sample Input => 07:05:45PM    
    // Sample Output => 19:05:45
    
    public static String timeConversion(String s) {
        DateTimeFormatter parser = DateTimeFormatter.ofPattern("hh:mm:ssa");
        LocalTime time = LocalTime.parse(s, parser);        
        if(time.getHour() == 00 && time.getSecond() == 00) {
            return String.format("%d0:%d0:%d0", time.getHour(), time.getMinute(), time.getSecond());
        } else {
            return time.toString();
        }
    }
}
```