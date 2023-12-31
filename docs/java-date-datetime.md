# Date & Datetime Samples

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

    // get day of week for a given year.
    public static String findDay(int month, int day, int year) {

        TimeZone timezone = TimeZone.getDefault();
        Calendar calendar = new GregorianCalendar(timezone);
        calendar.set(year, month - 1, day); // MONTH STARTS WITH ZERO
        SimpleDateFormat f = new SimpleDateFormat("EEEE");
        return f.format(calendar.getTime()).toUpperCase();
    }
}
```

```java
class Result {
    // convert date format output. 
    // sample Input => 07:05:45PM    
    // sample Output => 19:05:45
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