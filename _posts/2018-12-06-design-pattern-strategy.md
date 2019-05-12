---
layout: default
title:  Java Design Pattern - Strategy
date:   2018-12-06 20:18:00 +0100
category: Dev
---

## Strategy Design Pattern

#### Concept

We can select the behavior of an algorithm dynamically at runtime

#### Example

In a football match, at the last moment, in general, if Team A is leading Team B by a score of 1-0, instead of
attacking, Team A becomes defensive. On the other hand, Team B goes for an all-out attack to score.

The above concept is applicable to a computer football game also. Or, we can think of two dedicated
memories where upon fulfillment of one memory, we start storing the data in the second available memory.
So, a runtime check is necessary before the storing of data, and based on the situation, we’ll proceed.

```bash
public class Context {

    private IChoice myC;

    // Set a Strategy or algorithm in the Context
    public void SetChoice(IChoice ic) {
        myC = ic;
    }

    public void ShowChoice(String s1, String s2) {
        myC.myChoice(s1, s2);
    }
}
```

```bash
public class FirstChoice implements IChoice {

    @Override
    public void myChoice(String s1, String s2) {
        System.out.println("You wanted to add the numbers.");
        int int1, int2, sum;
        int1 = Integer.parseInt(s1);
        int2 = Integer.parseInt(s2);
        sum = int1 + int2;
        System.out.println(" The result of the addition is:" + sum);
        System.out.println("***End of the strategy***");
    }
}
```

```bash
public interface IChoice {
    void myChoice(String s1, String s2);
}

```

```bash
public class SecondChoice implements IChoice {

    @Override
    public void myChoice(String s1, String s2) {
        System.out.println("You wanted to concatenate the numbers.");
        System.out.println(" The result of the addition is:" + s1 + s2);
        System.out.println("***End of the strategy***");
    }
}
```

```bash
import java.util.Scanner;

public class StrategyPatternEx {

    public static void main(String[] args) {
        
        Scanner in = new Scanner(System.in);
        IChoice ic;
        Context cxt = new Context();
        String input1, input2;
            
        try {

            //Looping twice to test two different choices
            for (int i = 1; i <= 2; i++) {

                System.out.println("Enter an integer:");
                input1 = in.nextLine();
                System.out.println("Enter another integer:");
                input2 = in.nextLine();
                System.out.println("Enter ur choice(1 or 2)");
                System.out.println("Press 1 for Addition, 2 for Concatenation ");
                String c = in.nextLine();

                // If user input is 1, create object of FirstChoice (Strategy 1)
                if (c.equals("1")) {
                    ic = new FirstChoice();
                } else {
                    ic = new SecondChoice();
                }
                
                /*Associate the Strategy with Context*/
                cxt.SetChoice(ic);
                cxt.ShowChoice(input1, input2);
            }
        } finally {
            in.close();
        }        
    }
}

```
